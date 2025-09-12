import { Worker } from 'worker_threads';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Task, TaskResponse } from './worker';
import * as os from 'os';
import { AttestationResponseStatus } from '../response-status';
import { Web2JsonValidationError } from './utils';

interface QueuedTask {
  task: Task;
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}

/**
 * Manages a pool of worker threads that handle applying jq filters and ABI encoding to Web2Json response JSON data.
 * This prevents blocking the main thread in case of malicious or long-running jq filters or ABI encoding.
 */
@Injectable()
export class ThreadPoolService implements OnModuleInit, OnModuleDestroy {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: QueuedTask[] = [];

  private readonly logger = new Logger(ThreadPoolService.name);
  private readonly workerPath: string;
  private idCounter = 1;

  constructor(
    private taskTimeoutMs: number,
    private poolSize: number = os.cpus().length,
  ) {
    this.logger.log(
      'Starting thread pool service with pool size: ' + this.poolSize,
    );
    this.workerPath = './dist/verification/web-2-json/worker.js';
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

  private createWorker(): Worker {
    const id = this.idCounter++;
    const worker = new Worker(this.workerPath, {
      workerData: { id: `worker-${id}` },
      resourceLimits: { maxOldGenerationSizeMb: 128 }, // Limit memory to prevent memory-bomb attacks
    });

    worker.on('error', (error) => {
      this.logger.error(`Worker ${id} error:`, error);
      this.handleWorkerExit(worker);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        this.logger.log(`Worker ${id} exited with code ${code}`);
      }
      this.handleWorkerExit(worker);
    });

    this.workers.push(worker);
    this.availableWorkers.push(worker);

    return worker;
  }

  private handleWorkerExit(worker: Worker): void {
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

  private executeTaskOnWorker(worker: Worker, queuedTask: QueuedTask): void {
    let isTaskCompleted = false;

    const terminateWorker = () => {
      if (isTaskCompleted) return;
      isTaskCompleted = true;

      this.logger.log(`Task timeout occurred, terminating worker`);

      worker.off('message', messageHandler);
      worker.off('error', errorHandler);

      worker.terminate().catch((terminateError) => {
        this.logger.error('Error terminating worker:', terminateError);
      });

      this.handleWorkerExit(worker);

      queuedTask.reject(
        new Web2JsonValidationError(
          AttestationResponseStatus.PROCESSING_TIMEOUT,
          'Filtering and encoding JSON timed out',
        ),
      );

      this.processQueue();
    };

    const workerTimeout = setTimeout(terminateWorker, this.taskTimeoutMs);

    const messageHandler = (response: TaskResponse) => {
      if (isTaskCompleted) return;
      if (response.id !== queuedTask.task.id) {
        this.logger.error('Mismatched task ID in worker response');
        return;
      }

      isTaskCompleted = true;

      worker.off('message', messageHandler);
      worker.off('error', errorHandler);
      clearTimeout(workerTimeout);

      this.availableWorkers.push(worker);

      if (response.success && response.result) {
        queuedTask.resolve(response.result);
      } else {
        queuedTask.reject(response.error);
      }

      this.processQueue();
    };

    const errorHandler = (error: Error) => {
      if (isTaskCompleted) return;
      isTaskCompleted = true;

      this.logger.error('Unexpected worker error:', error);

      worker.off('message', messageHandler);
      worker.off('error', errorHandler);
      clearTimeout(workerTimeout);

      queuedTask.reject(error);
      this.handleWorkerExit(worker);
      this.processQueue();
    };

    worker.on('message', messageHandler);
    worker.on('error', errorHandler);
    worker.postMessage(queuedTask.task);
  }

  private async shutdown(): Promise<void> {
    this.taskQueue.forEach((queuedTask) => {
      queuedTask.reject(new Error('Thread pool is shutting down'));
    });
    this.taskQueue = [];

    const terminationPromises = this.workers.map(async (worker) =>
      worker.terminate(),
    );

    await Promise.allSettled(terminationPromises);
    this.workers = [];
    this.availableWorkers = [];
  }
}
