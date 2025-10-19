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
import { ParamType } from 'ethers';

interface QueuedRequest {
  task: ProcessRequestMessage;
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}

/**
 * Manages a pool of child processes that handle applying jq filters and ABI encoding to Web2Json response JSON data.
 * This prevents blocking the main process in case of malicious or long-running requests.
 *
 * Child processes are used instead of worker threads to be able to gracefully handle OOM errors.
 */
@Injectable()
export class ProcessPoolService implements OnModuleInit, OnModuleDestroy {
  private workers: ChildProcess[] = [];
  private availableWorkers: ChildProcess[] = [];
  private requestQueue: QueuedRequest[] = [];

  private readonly logger = new Logger(ProcessPoolService.name);
  private readonly workerPath: string;
  private idCounter = 1;
  private shutdownInitiated = false;

  constructor(
    private readonly requestTimeoutMs: number,
    private readonly poolSize: number = os.cpus().length,
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

  onModuleDestroy() {
    this.logger.log('Shutting down thread pool...');
    this.shutdown();
  }

  private initializePool(): void {
    for (let i = 0; i < this.poolSize; i++) {
      this.createWorker();
    }
  }

  private createWorker(): ChildProcess {
    if (this.shutdownInitiated) {
      return;
    }
    const id = this.idCounter++;
    const child = fork(this.workerPath, {
      // Restrict memory usage to 256MB.
      execArgv: ['--max-old-space-size=256'],
      // Do not inherit parent environment.
      env: { WORKER_ID: id.toString() },
      // Disable child stdin, allow stdout and stderr to capture worker logs.
      stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
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

  private terminateWorker(worker: ChildProcess): void {
    worker.removeAllListeners('message');
    worker.kill('SIGKILL');
    this.handleWorkerExit(worker);
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
    abiType: ParamType,
  ): Promise<string> {
    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const request: ProcessRequestMessage = {
      id: requestId,
      jsonData: jsonData,
      jqScheme,
      abiType,
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

    // Ensures cleanup and processing of next queue item, runs only once
    const completeRequest = (callback: () => void) => {
      if (isRequestCompleted) return;
      isRequestCompleted = true;
      worker.off('message', messageHandler);
      worker.off('error', errorHandler);
      clearTimeout(workerTimeout);
      callback();
      this.processQueue();
    };

    // Terminate worker process on timeout, replace it with a new one
    const timeoutHandler = () => {
      completeRequest(() => {
        this.logger.warn(
          `[${queuedRequest.task.id}] Data processing timeout occurred, terminating worker process`,
        );
        this.terminateWorker(worker);
        queuedRequest.reject(
          new Web2JsonValidationError(
            AttestationResponseStatus.PROCESSING_TIMEOUT,
            'Processing JSON response timed out',
          ),
        );
      });
    };

    const workerTimeout = setTimeout(timeoutHandler, this.requestTimeoutMs);

    // Handle normal worker responses, including jq or encoding errors
    const messageHandler = (result: ProcessResultMessage) => {
      if (!result || result.id !== queuedRequest.task.id) return; // ignore unrelated
      completeRequest(() => {
        this.availableWorkers.push(worker);

        if (result.success && result.result) {
          queuedRequest.resolve(result.result);
        } else {
          queuedRequest.reject(
            new Web2JsonValidationError(
              result.error?.status || AttestationResponseStatus.UNKNOWN_ERROR,
              result.error?.message || 'Unknown worker error',
            ),
          );
        }
      });
    };

    // Handle unexpected worker errors
    const errorHandler = (error: Error) => {
      completeRequest(() => {
        this.logger.error(
          `${queuedRequest.task.id} Unexpected worker process error:`,
          error,
        );
        queuedRequest.reject(
          new Web2JsonValidationError(
            AttestationResponseStatus.UNKNOWN_ERROR,
            error?.message || 'Unknown worker error',
          ),
        );
        this.terminateWorker(worker);
      });
    };

    worker.on('message', messageHandler);
    worker.on('error', errorHandler);

    try {
      worker.send(queuedRequest.task);
    } catch (e) {
      completeRequest(() => {
        this.logger.error(
          `${queuedRequest.task.id} Unexpected worker process error when dispatching request:`,
          e,
        );
        queuedRequest.reject(
          new Web2JsonValidationError(
            AttestationResponseStatus.UNKNOWN_ERROR,
            'Failed to dispatch request to worker process',
          ),
        );
        this.terminateWorker(worker);
      });
    }
  }

  private shutdown() {
    this.shutdownInitiated = true;
    this.requestQueue.forEach((queuedTask) => {
      queuedTask.reject(new Error('Process pool is shutting down'));
    });
    this.requestQueue = [];

    this.workers.forEach((worker) => {
      worker.removeAllListeners('message');
      worker.kill('SIGKILL');
    });
    this.workers = [];
    this.availableWorkers = [];
    this.logger.log('Process pool shut down.');
  }
}
