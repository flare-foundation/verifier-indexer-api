import { abiEncode } from './utils';
import * as jq from 'jq-wasm';
import { AttestationResponseStatus } from '../response-status';

export interface Task {
  id: string;
  jsonData: object | string;
  jqScheme: string;
  abiSignature: object;
}

interface SerializedError {
  attestationResponseStatus: AttestationResponseStatus;
  message: string;
}

export interface TaskResponse {
  id: string;
  success: boolean;
  result?: string;
  error?: SerializedError;
}

function buildError(
  status: AttestationResponseStatus,
  err: unknown,
): SerializedError {
  return {
    attestationResponseStatus: status,
    message: err instanceof Error ? err.message : String(err),
  };
}

async function processTask(task: Task): Promise<TaskResponse> {
  try {
    const jqResult = await jq.json(task.jsonData, task.jqScheme);
    try {
      const encoded = abiEncode(jqResult, task.abiSignature);
      return { id: task.id, success: true, result: encoded };
    } catch (encodeErr) {
      return {
        id: task.id,
        success: false,
        error: buildError(
          AttestationResponseStatus.INVALID_ENCODE_ERROR,
          encodeErr,
        ),
      };
    }
  } catch (jqErr) {
    return {
      id: task.id,
      success: false,
      error: buildError(
        AttestationResponseStatus.INVALID_JQ_PARSE_ERROR,
        jqErr,
      ),
    };
  }
}

process.on('message', (task: Task) => {
  processTask(task)
    .then((r) => process.send(r))
    .catch((unhandled) => {
      process.send({
        id: task?.id || 'unknown',
        success: false,
        error: buildError(AttestationResponseStatus.UNKNOWN_ERROR, unhandled),
      });
    });
});

process.on('disconnect', () => process.exit(0));
