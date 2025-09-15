import { abiEncode } from './utils';
import * as jq from 'jq-wasm';
import { AttestationResponseStatus } from '../response-status';

export interface ProcessRequestMessage {
  id: string;
  jsonData: object | string;
  jqScheme: string;
  abiSignature: object;
}

interface ProcessErrorMessage {
  attestationResponseStatus: AttestationResponseStatus;
  message: string;
}

export interface ProcessResultMessage {
  id: string;
  success: boolean;
  result?: string;
  error?: ProcessErrorMessage;
}

function buildError(
  status: AttestationResponseStatus,
  err: unknown,
): ProcessErrorMessage {
  return {
    attestationResponseStatus: status,
    message: err instanceof Error ? err.message : String(err),
  };
}

async function execute(request: ProcessRequestMessage): Promise<ProcessResultMessage> {
  try {
    const jqResult = await jq.json(request.jsonData, request.jqScheme);
    try {
      const encoded = abiEncode(jqResult, request.abiSignature);
      return { id: request.id, success: true, result: encoded };
    } catch (encodeErr) {
      return {
        id: request.id,
        success: false,
        error: buildError(
          AttestationResponseStatus.INVALID_ENCODE_ERROR,
          encodeErr,
        ),
      };
    }
  } catch (jqErr) {
    return {
      id: request.id,
      success: false,
      error: buildError(
        AttestationResponseStatus.INVALID_JQ_PARSE_ERROR,
        jqErr,
      ),
    };
  }
}

process.on('message', (request: ProcessRequestMessage) => {
  execute(request)
    .then((response) => process.send(response))
    .catch((unhandled) => {
      process.send({
        id: request?.id || 'unknown',
        success: false,
        error: buildError(AttestationResponseStatus.UNKNOWN_ERROR, unhandled),
      });
    });
});

process.on('disconnect', () => process.exit(0));
