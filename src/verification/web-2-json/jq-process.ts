import * as jq from 'jq-wasm';
import {
  JqMessage,
  ProcessErrorMessage,
  ProcessResultMessage,
} from 'src/config/interfaces/web2Json';
import { isJqMessage } from './utils';

async function handleJqMessage(message: JqMessage): Promise<void> {
  try {
    const result = await jq.json(message.jsonData, message.jqScheme);
    const response: ProcessResultMessage<object> = {
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

process.on('message', (message: JqMessage) => {
  if (!isJqMessage(message)) {
    const errorResponse: ProcessErrorMessage = {
      status: 'error',
      error: 'Invalid message structure',
    };
    process.send(errorResponse);
    return;
  }
  handleJqMessage(message).catch((error) => {
    console.error('Error handling jq message:', error);
  });
});
