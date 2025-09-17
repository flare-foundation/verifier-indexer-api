import { abiEncode } from './utils';
import * as jq from 'jq-wasm';
import { AttestationResponseStatus } from '../response-status';
import { Logger } from '@nestjs/common';
import { errorString } from '../../utils/error';

export interface ProcessRequestMessage {
  id: string;
  jsonData: object | string;
  jqScheme: string;
  abiSignature: object;
}

interface ProcessErrorMessage {
  status: AttestationResponseStatus;
  message: string;
}

export interface ProcessResultMessage {
  id: string;
  success: boolean;
  result?: string;
  error?: ProcessErrorMessage;
}

const logger = new Logger(`Worker-${process.env.WORKER_ID}`);

async function execute(
  request: ProcessRequestMessage,
): Promise<ProcessResultMessage> {
  logger.debug(
    `Processing request: ${request.id}, jq: ${request.jqScheme}, abi: ${JSON.stringify(request.abiSignature)}`,
  );
  try {
    const jqResult = await jq.json(request.jsonData, request.jqScheme);
    try {
      const encoded = abiEncode(jqResult, request.abiSignature);
      logger.debug(`[${request.id}] Processed successfully`);
      return { id: request.id, success: true, result: encoded };
    } catch (encodeErr) {
      logger.debug(`[${request.id}] Encoding error: ${errorString(encodeErr)}`);
      return {
        id: request.id,
        success: false,
        error: {
          status: AttestationResponseStatus.INVALID_ENCODE_ERROR,
          message: errorString(encodeErr),
        },
      };
    }
  } catch (jqErr) {
    logger.debug(`[${request.id}] Jq error: ${jqErr}`);
    return {
      id: request.id,
      success: false,
      error: {
        status: AttestationResponseStatus.INVALID_JQ_PARSE_ERROR,
        message: errorString(jqErr),
      },
    };
  }
}

process.on('message', (request: ProcessRequestMessage) => {
  execute(request)
    .then((response) => process.send(response))
    .catch((unhandled) => {
      logger.error(
        `[${request.id}] Unexpected error: ${errorString(unhandled)}`,
      );
      process.send({
        id: request.id,
        success: false,
        error: {
          status: AttestationResponseStatus.UNKNOWN_ERROR,
          message: errorString(unhandled),
        },
      });
    });
});

process.on('disconnect', () => process.exit(0));
