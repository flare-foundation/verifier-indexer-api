import { ethers, ParamType } from 'ethers';
import { isStringArray } from './utils';
import * as jq from 'jq-wasm';
import { parentPort } from 'worker_threads';

export interface Task {
  id: string;
  jsonData: object | string;
  jqScheme: string;
  abiSignature: string | string[] | ParamType[];
}

export interface TaskResponse {
  id: string;
  success: boolean;
  result?: string;
  error?: string;
}

async function processTask(task: Task): Promise<void> {
  const response: TaskResponse = {
    id: task.id,
    success: false,
  };

  try {
    // Step 1: Apply JQ filter
    const jqResult = await jq.json(task.jsonData, task.jqScheme);

    // Step 2: ABI encode the result
    const encodedData = abiEncode(jqResult, task.abiSignature);

    response.success = true;
    response.result = encodedData;
  } catch (error) {
    response.error = error instanceof Error ? error.message : String(error);
  }

  parentPort?.postMessage(response);
}

/**
 * Handles ABI encoding using the provided ABI signature and data.
 * Converts the ABI signature to ParamType and encodes the input using ethers.js.
 */
function abiEncode(
  data: object | string,
  abiSignature: string | string[] | ParamType[],
): string {
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
