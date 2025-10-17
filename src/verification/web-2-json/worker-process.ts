import { abiEncode } from './utils';
import { AttestationResponseStatus } from '../response-status';
import { Logger } from '@nestjs/common';
import { errorString } from '../../utils/error';
import { evaluate, parse } from '@jq-tools/jq';
import { performance } from 'perf_hooks';

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
  const start = performance.now();
  try {
    const jqResult = runJq(request.jqScheme, request.jsonData);
    logger.debug(
      `[${request.id}] Jq result [${performance.now() - start}]: ${JSON.stringify(jqResult)}`,
    );
    const jqDone = performance.now();
    try {
      const encoded = abiEncode(jqResult, request.abiSignature);
      const encodeDone = performance.now();
      logger.debug(
        `[${request.id}] Processed successfully (total=${encodeDone - start}ms, jq=${jqDone - start}ms, encode=${encodeDone - jqDone}ms)`,
      );
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

function runJq(expr: string, data: any): object | object[] {
  const query = parse(expr);
  const output = evaluate(query, [data]);
  const result = Array.from(output);
  if (result.length === 1) {
    return result[0];
  } else {
    return result;
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
