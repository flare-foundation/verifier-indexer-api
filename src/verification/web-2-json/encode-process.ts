import { ethers } from 'ethers';
import {
  ErrorMessage,
  EncodeMessage,
  EncodeResultMessage,
} from 'src/config/interfaces/web2Json';

function handleEncodeMessage(message: EncodeMessage): void {
  try {
    const parsed = Array.isArray(message.abiSignature)
      ? message.abiSignature.map((t) => ethers.ParamType.from(t))
      : [ethers.ParamType.from(message.abiSignature)];
    const result = ethers.AbiCoder.defaultAbiCoder().encode(parsed, [
      message.jqPostProcessData,
    ]);
    const response: EncodeResultMessage = {
      status: 'success',
      result,
    };
    process.send(response);
  } catch (error) {
    const errorResponse: ErrorMessage = {
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
    process.send(errorResponse);
  }
}

process.on('message', (message: EncodeMessage) => {
  handleEncodeMessage(message);
});
