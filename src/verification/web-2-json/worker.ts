import { ethers, ParamType } from 'ethers';
import { isStringArray, Web2JsonValidationError } from './utils';
import * as jq from 'jq-wasm';
import { parentPort } from 'worker_threads';
import { AttestationResponseStatus } from '../response-status';
import { Logger } from '@nestjs/common';

export interface Task {
  id: string;
  jsonData: object | string;
  jqScheme: string;
  abiSignature: object;
}

export interface TaskResponse {
  id: string;
  success: boolean;
  result?: string;
  error?: Web2JsonValidationError;
}

export async function processTask(task: Task): Promise<void> {
  const response: TaskResponse = {
    id: task.id,
    success: false,
  };

  let jqResult: object | object[];
  try {
    jqResult = await jq.json(task.jsonData, task.jqScheme);
    Logger.log('JQ result:', jqResult);
  } catch (error) {
    response.error = new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_JQ_PARSE_ERROR,
      error instanceof Error ? error.message : String(error),
    );
    parentPort?.postMessage(response);
    return;
  }

  let encodedData: string;
  try {
    encodedData = abiEncode(jqResult, task.abiSignature);
  } catch (error) {
    response.error = new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_ENCODE_ERROR,
      error instanceof Error ? error.message : String(error),
    );
    parentPort?.postMessage(response);
    return;
  }

  response.success = true;
  response.result = encodedData;
  parentPort?.postMessage(response);
}

/**
 * Handles ABI encoding using the provided ABI signature and data.
 * Converts the ABI signature to ParamType and encodes the input using ethers.js.
 */
function abiEncode(data: object | string, abiSignature: object): string {
  let parsed: string[] | ParamType[];
  // parse the ABI signature depending on its type
  if (isStringArray(abiSignature as unknown)) {
    parsed = (abiSignature as string[]).map((t) => ethers.ParamType.from(t));
  } else if (Array.isArray(abiSignature)) {
    parsed = abiSignature as ParamType[];
  } else {
    parsed = [ethers.ParamType.from(abiSignature)];
  }
  // perform ABI encoding
  return ethers.AbiCoder.defaultAbiCoder().encode(parsed, [data]);
}

parentPort?.on('message', (task: Task) => {
  processTask(task).catch((error) => {
    console.error('Error processing atomic task:', error);
  });
});
