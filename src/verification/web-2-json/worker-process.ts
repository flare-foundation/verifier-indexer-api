import { abiEncode, getPreview } from './utils';
import { AttestationResponseStatus } from '../response-status';
import { Logger } from '@nestjs/common';
import { performance } from 'perf_hooks';
import { ParamType } from 'ethers';
import { errorString } from '../../utils/error';
import { evaluate, parse } from '@jq-tools/jq';

export interface ProcessRequestMessage {
  id: string;
  jsonData: object | string;
  jqScheme: string;
  abiType: ParamType;
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

function execute(request: ProcessRequestMessage): ProcessResultMessage {
  logger.debug(
    `Processing request: ${request.id}, jq: ${request.jqScheme}, abi: ${JSON.stringify(request.abiType)}`,
  );
  const start = performance.now();
  try {
    const jqResult = runJq(request.jqScheme, request.jsonData);
    const jqDone = performance.now();
    logger.debug(
      `[${request.id}] Jq result: ${getPreview(JSON.stringify(jqResult))}`,
    );

    try {
      const encoded = abiEncode(jqResult, request.abiType);
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

export function runJq(expr: string, data: string | object): object | object[] {
  const query = parse(expr);
  const output = evaluate(query, [data]) as Iterable<unknown>;
  const result = Array.from(output) as object[];
  if (result.length === 1) {
    return result[0];
  }
  return result;
}

process.on('message', (request: ProcessRequestMessage) => {
  try {
    const result = execute(request);
    process.send(result);
  } catch (err) {
    logger.error(`[${request.id}] Unexpected error: ${errorString(err)}`);
    process.send({
      id: request.id,
      success: false,
      error: {
        status: AttestationResponseStatus.UNKNOWN_ERROR,
        message: errorString(err),
      },
    });
  }
});

process.on('disconnect', () => process.exit(0));
