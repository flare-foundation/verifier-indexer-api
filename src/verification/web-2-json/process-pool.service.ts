import { ChildProcess, fork } from 'child_process';
import { ProcessRequestMessage, ProcessResultMessage } from './worker-process';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as os from 'os';
import { AttestationResponseStatus } from '../response-status';
import { Web2JsonValidationError } from './utils';

interface QueuedRequest {
  task: ProcessRequestMessage;
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}

/**
 * Manages a pool of child processes that handle applying jq filters and ABI encoding to Web2Json response JSON data.
 * This prevents blocking the main process in case of malicious or long-running jq filters or ABI encoding.
 *
 * Child processes are used instead of worker threads to be able to handle OOM errors caused by malicious requests.
 */
@Injectable()
export class ProcessPoolService implements OnModuleInit, OnModuleDestroy {
  private workers: ChildProcess[] = [];
  private availableWorkers: ChildProcess[] = [];
  private requestQueue: QueuedRequest[] = [];

  private readonly logger = new Logger(ProcessPoolService.name);
  private readonly workerPath: string;
  private idCounter = 1;

  constructor(
    private requestTimeoutMs: number,
    private poolSize: number = os.cpus().length,
  ) {
    this.logger.log(
      'Starting process pool service with pool size: ' + this.poolSize,
    );
    this.workerPath = './dist/verification/web-2-json/worker-process.js';
  }

  onModuleInit() {
    this.logger.log(
      `Initializing thread pool with ${this.poolSize} workers...`,
    );
    this.initializePool();
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down thread pool...');
    await this.shutdown();
  }

  private initializePool(): void {
    for (let i = 0; i < this.poolSize; i++) {
      this.createWorker();
    }
  }

  private createWorker(): ChildProcess {
    const id = this.idCounter++;
    const child = fork(this.workerPath, {
      execArgv: ['--max-old-space-size=128'], // memory cap per process
      env: { ...process.env, WORKER_ID: `proc-${id}` },
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    });

    child.on('error', (error) => {
      this.logger.error(`Worker process ${id} error:`, error);
      this.handleWorkerExit(child);
    });

    child.on('exit', (code, signal) => {
      if (code !== 0) {
        this.logger.log(
          `Worker process ${id} exited with code ${code} signal ${signal}`,
        );
      }
      this.handleWorkerExit(child);
    });

    this.workers.push(child);
    this.availableWorkers.push(child);

    return child;
  }

  private handleWorkerExit(worker: ChildProcess): void {
    this.workers = this.workers.filter((w) => w !== worker);
    this.availableWorkers = this.availableWorkers.filter((w) => w !== worker);

    if (this.workers.length < this.poolSize) {
      this.createWorker();
    }
  }

  public async filterAndEncodeData(
    jsonData: object | string,
    jqScheme: string,
    abiSignature: object,
  ): Promise<string> {
    const requestId = `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const request: ProcessRequestMessage = {
      id: requestId,
      jsonData: jsonData,
      jqScheme,
      abiSignature,
    };

    return new Promise<string>((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        task: request,
        resolve,
        reject,
      };
      this.requestQueue.push(queuedRequest);
      this.processQueue();
    });
  }

  private processQueue(): void {
    while (this.requestQueue.length > 0 && this.availableWorkers.length > 0) {
      const queuedRequest = this.requestQueue.shift();
      const worker = this.availableWorkers.shift();

      if (queuedRequest && worker) {
        this.executeRequestOnWorker(worker, queuedRequest);
      }
    }
  }

  private executeRequestOnWorker(
    worker: ChildProcess,
    queuedRequest: QueuedRequest,
  ): void {
    let isRequestCompleted = false;

    const finishTask = (cb: () => void) => {
      if (isRequestCompleted) return;
      isRequestCompleted = true;
      worker.off('message', messageHandler);
      worker.off('error', errorHandler);
      cb();
      this.processQueue();
    };

    const terminateWorker = () => {
      finishTask(() => {
        this.logger.log(`Task timeout occurred, killing worker process`);
        worker.removeAllListeners('message');
        worker.kill('SIGKILL');
        this.handleWorkerExit(worker);
        queuedRequest.reject(
          new Web2JsonValidationError(
            AttestationResponseStatus.PROCESSING_TIMEOUT,
            'Filtering and encoding JSON timed out',
          ),
        );
      });
    };

    const workerTimeout = setTimeout(terminateWorker, this.requestTimeoutMs);

    const messageHandler = (raw: ProcessResultMessage) => {
      if (isRequestCompleted) return;
      if (!raw || raw.id !== queuedRequest.task.id) return; // ignore unrelated

      finishTask(() => {
        clearTimeout(workerTimeout);

        this.availableWorkers.push(worker);
        if (raw.success && raw.result) {
          queuedRequest.resolve(raw.result);
        } else if (raw.error) {
          queuedRequest.reject(
            new Web2JsonValidationError(
              raw.error.attestationResponseStatus ||
                AttestationResponseStatus.UNKNOWN_ERROR,
              raw.error.message,
            ),
          );
        } else {
          queuedRequest.reject(
            new Web2JsonValidationError(
              AttestationResponseStatus.UNKNOWN_ERROR,
              'Unknown worker response',
            ),
          );
        }
      });
    };

    const errorHandler = (error: Error) => {
      finishTask(() => {
        clearTimeout(workerTimeout);
        this.logger.error('Unexpected worker process error:', error);
        queuedRequest.reject(error);
        this.handleWorkerExit(worker);
      });
    };

    worker.on('message', messageHandler);
    worker.on('error', errorHandler);

    try {
      worker.send(queuedRequest.task);
    } catch (e) {
      finishTask(() => {
        clearTimeout(workerTimeout);
        this.logger.error('Unexpected worker process error:', e);
        queuedRequest.reject(
          new Web2JsonValidationError(
            AttestationResponseStatus.UNKNOWN_ERROR,
            'Failed to dispatch task to worker process',
          ),
        );
        this.handleWorkerExit(worker);
      });
    }
  }

  private async shutdown(): Promise<void> {
    this.requestQueue.forEach((queuedTask) => {
      queuedTask.reject(new Error('Process pool is shutting down'));
    });
    this.requestQueue = [];

    const terminationPromises = this.workers.map(async (worker) => {
      worker.removeAllListeners('message');
      worker.kill('SIGKILL');
    });

    await Promise.allSettled(terminationPromises);
    this.workers = [];
    this.availableWorkers = [];
  }
}
