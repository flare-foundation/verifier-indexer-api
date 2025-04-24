import { ethers, ParamType } from 'ethers';
import {
  ProcessErrorMessage,
  EncodeMessage,
  ProcessResultMessage,
} from 'src/config/interfaces/web2Json';
import { isEncodeMessage, isStringArray } from './utils';

function handleEncodeMessage(message: EncodeMessage): void {
  try {
    let parsed: string[] | ParamType[];
    if (isStringArray(message.abiSignature)) {
      parsed = message.abiSignature.map((t) => ethers.ParamType.from(t));
    } else if (Array.isArray(message.abiSignature)) {
      parsed = message.abiSignature;
    } else {
      parsed = [ethers.ParamType.from(message.abiSignature)];
    }
    const result = ethers.AbiCoder.defaultAbiCoder().encode(parsed, [
      message.jqPostProcessData,
    ]);
    const response: ProcessResultMessage<object | string> = {
      status: 'success',
      result,
    };
    process.send(response);
  } catch (error) {
    const errorResponse: ProcessErrorMessage = {
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
    process.send(errorResponse);
  }
}

process.on('message', (message: EncodeMessage) => {
  if (!isEncodeMessage(message)) {
    const errorResponse: ProcessErrorMessage = {
      status: 'error',
      error: 'Invalid message structure',
    };
    process.send(errorResponse);
    return;
  }
  handleEncodeMessage(message);
});
