import { Worker } from 'worker_threads';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Task, TaskResponse } from './worker';
import * as os from 'os';

interface QueuedTask {
  task: Task;
  resolve: (value: string) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
  timeoutMs: number; // Store timeout for worker termination
}

@Injectable()
export class ThreadPoolService implements OnModuleInit, OnModuleDestroy {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: QueuedTask[] = [];
  private readonly logger = new Logger(ThreadPoolService.name);
  private readonly poolSize: number;
  private readonly workerPath: string;

  constructor() {
    this.poolSize = Math.min(4, os.cpus().length); // Use up to 4 workers or CPU count
    this.logger.log("Starting thread pool service with pool size: " + this.poolSize);
    this.workerPath = "./dist/verification/web-2-json/worker.js";
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
    const id = this.workers.length + 1;
    const worker = new Worker(this.workerPath, {
      workerData: { id: `worker-${id}` },
      resourceLimits: { maxOldGenerationSizeMb: 128 }, // Set memory limit (example: 128MB)
    });

    worker.on('error', (error) => {
      this.logger.error(`Worker ${id} error:`, error);
      this.handleWorkerExit(worker);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        this.logger.warn(`Worker ${id} exited with code ${code}`);
      }
      this.handleWorkerExit(worker);
    });

    this.workers.push(worker);
    this.availableWorkers.push(worker);

    return worker;
  }

  private handleWorkerExit(worker: Worker): void {
    // Remove from both arrays
    this.workers = this.workers.filter((w) => w !== worker);
    this.availableWorkers = this.availableWorkers.filter((w) => w !== worker);

    // Create a new worker to maintain pool size
    if (this.workers.length < this.poolSize) {
      this.createWorker();
    }
  }

  public async executeAtomicTask(
    jsonData: object | string,
    jqScheme: string,
    abiSignature: object,
    timeoutMs: number,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // Use timeout plus some buffer for overall task timeout
      const overallTimeoutMs = timeoutMs + 1000;
      let timeoutOccurred = false;

      const timeout = setTimeout(() => {
        timeoutOccurred = true;
        reject(new Error('Atomic process exceeded overall timeout'));
      }, overallTimeoutMs);

      const taskId = `task-${Date.now()}-${Math.random()}`;
      const atomicTask: Task = {
        id: taskId,
        jsonData,
        jqScheme,
        abiSignature: abiSignature as string | string[],
      };

      const queuedTask: QueuedTask = {
        task: atomicTask,
        resolve: (value) => {
          if (!timeoutOccurred) {
            clearTimeout(timeout);
            resolve(value);
          }
        },
        reject: (error) => {
          if (!timeoutOccurred) {
            clearTimeout(timeout);
            reject(error);
          }
        },
        timeout,
        timeoutMs, // Store timeout for worker termination
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

    const messageHandler = (response: TaskResponse) => {
      if (isTaskCompleted) return;
      if (response.id !== queuedTask.task.id) return; // Ensure we're handling the right task

      isTaskCompleted = true;

      worker.off('message', messageHandler);
      worker.off('error', errorHandler);
      clearTimeout(queuedTask.timeout);

      // Return worker to available pool
      this.availableWorkers.push(worker);

      if (response.success && response.result) {
        // Since we removed jqResult from response, we need to provide it for compatibility
        queuedTask.resolve(response.result);
      } else {
        queuedTask.reject(new Error(response.error || 'Unknown worker error'));
      }

      // Process next task in queue
      this.processQueue();
    };

    const errorHandler = (error: Error) => {
      if (isTaskCompleted) return;
      isTaskCompleted = true;

      worker.off('message', messageHandler);
      worker.off('error', errorHandler);
      clearTimeout(queuedTask.timeout);

      queuedTask.reject(error);
      this.handleWorkerExit(worker);
      this.processQueue();
    };

    // Override the task timeout to kill the worker thread when timeout occurs
    const originalTimeout = queuedTask.timeout;
    clearTimeout(originalTimeout);

    const timeoutHandler = () => {
      if (isTaskCompleted) return;
      isTaskCompleted = true;

      this.logger.warn('Task timeout occurred, terminating worker thread');

      worker.off('message', messageHandler);
      worker.off('error', errorHandler);

      // Terminate the worker thread to kill any dangling processes
      worker.terminate().catch((terminateError) => {
        this.logger.error('Error terminating worker:', terminateError);
      });

      // Remove from available workers and create a new one
      this.handleWorkerExit(worker);

      queuedTask.reject(
        new Error('Atomic process exceeded timeout and worker was terminated'),
      );

      // Process next task in queue
      this.processQueue();
    };

    const newTimeout = setTimeout(timeoutHandler, queuedTask.timeoutMs + 500);
    queuedTask.timeout = newTimeout;

    worker.on('message', messageHandler);
    worker.on('error', errorHandler);
    worker.postMessage(queuedTask.task);
  }

  private async shutdown(): Promise<void> {
    // Clear any pending tasks
    this.taskQueue.forEach((queuedTask) => {
      clearTimeout(queuedTask.timeout);
      queuedTask.reject(new Error('Thread pool is shutting down'));
    });
    this.taskQueue = [];

    // Terminate all workers
    const terminationPromises = this.workers.map(async (worker) => {
      return worker.terminate();
    });

    await Promise.allSettled(terminationPromises);
    this.workers = [];
    this.availableWorkers = [];
  }
}
