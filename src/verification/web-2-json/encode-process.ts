import { ethers, ParamType } from 'ethers';
import {
  ProcessErrorMessage,
  EncodeMessage,
  ProcessResultMessage,
} from 'src/config/interfaces/web2Json';
import { isEncodeMessage, isStringArray } from './utils';

/**
 * Handles ABI encoding using the provided ABI signature and data.
 * Converts the ABI signature to ParamType, encodes the input using ethers.js,
 * and sends the result back to the parent process.
 *
 * @param message - Contains ABI signature and data to encode
 */
function handleEncodeMessage(message: EncodeMessage): void {
  try {
    let parsed: string[] | ParamType[];
    // parse the ABI signature depending on its type
    if (isStringArray(message.abiSignature)) {
      parsed = message.abiSignature.map((t) => ethers.ParamType.from(t));
    } else if (Array.isArray(message.abiSignature)) {
      parsed = message.abiSignature;
    } else {
      parsed = [ethers.ParamType.from(message.abiSignature)];
    }
    // perform ABI encoding
    const result = ethers.AbiCoder.defaultAbiCoder().encode(parsed, [
      message.jqPostProcessData,
    ]);
    // send encoded result back to the parent process
    const response: ProcessResultMessage<object | string> = {
      status: 'success',
      result,
    };
    process.send(response);
  } catch (error) {
    // handle and return encoding errors
    const errorResponse: ProcessErrorMessage = {
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
    process.send(errorResponse);
  }
}

// listen for messages and trigger encoding logic
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
