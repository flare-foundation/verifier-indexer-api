import { ChildProcess, fork } from 'child_process';
import { Task, TaskResponse } from './worker-process';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as os from 'os';
import { AttestationResponseStatus } from '../response-status';
import { Web2JsonValidationError } from './utils';

interface QueuedTask {
  task: Task;
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
  private taskQueue: QueuedTask[] = [];

  private readonly logger = new Logger(ProcessPoolService.name);
  private readonly workerPath: string;
  private idCounter = 1;

  constructor(
    private taskTimeoutMs: number,
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

  public async processTask(
    jsonData: object | string,
    jqScheme: string,
    abiSignature: object,
  ): Promise<string> {
    const taskId = `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const task: Task = {
      id: taskId,
      jsonData: jsonData,
      jqScheme,
      abiSignature,
    };

    return new Promise<string>((resolve, reject) => {
      const queuedTask: QueuedTask = {
        task,
        resolve,
        reject,
      };
      this.taskQueue.push(queuedTask);
      this.processQueue();
    });
  }

  private processQueue(): void {
    while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const queuedTask = this.taskQueue.shift();
      const worker = this.availableWorkers.shift();

      if (queuedTask && worker) {
        this.executeTaskOnWorker(worker, queuedTask);
      }
    }
  }

  private executeTaskOnWorker(
    worker: ChildProcess,
    queuedTask: QueuedTask,
  ): void {
    let isTaskCompleted = false;

    const finishTask = (cb: () => void) => {
      if (isTaskCompleted) return;
      isTaskCompleted = true;
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
        queuedTask.reject(
          new Web2JsonValidationError(
            AttestationResponseStatus.PROCESSING_TIMEOUT,
            'Filtering and encoding JSON timed out',
          ),
        );
      });
    };

    const workerTimeout = setTimeout(terminateWorker, this.taskTimeoutMs);

    const messageHandler = (raw: TaskResponse) => {
      if (isTaskCompleted) return;
      if (!raw || raw.id !== queuedTask.task.id) return; // ignore unrelated

      finishTask(() => {
        clearTimeout(workerTimeout);

        this.availableWorkers.push(worker);
        if (raw.success && raw.result) {
          queuedTask.resolve(raw.result);
        } else if (raw.error) {
          queuedTask.reject(
            new Web2JsonValidationError(
              raw.error.attestationResponseStatus ||
                AttestationResponseStatus.UNKNOWN_ERROR,
              raw.error.message,
            ),
          );
        } else {
          queuedTask.reject(
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
        queuedTask.reject(error);
        this.handleWorkerExit(worker);
      });
    };

    worker.on('message', messageHandler);
    worker.on('error', errorHandler);

    try {
      worker.send(queuedTask.task);
    } catch (e) {
      finishTask(() => {
        clearTimeout(workerTimeout);
        this.logger.error('Unexpected worker process error:', e);
        queuedTask.reject(
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
    this.taskQueue.forEach((queuedTask) => {
      queuedTask.reject(new Error('Process pool is shutting down'));
    });
    this.taskQueue = [];

    const terminationPromises = this.workers.map(async (worker) => {
      worker.removeAllListeners('message');
      worker.kill('SIGKILL');
    });

    await Promise.allSettled(terminationPromises);
    this.workers = [];
    this.availableWorkers = [];
  }
}
