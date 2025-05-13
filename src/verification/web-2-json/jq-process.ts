import * as jq from 'jq-wasm';
import {
  JqMessage,
  ProcessErrorMessage,
  ProcessResultMessage,
} from 'src/config/interfaces/web2Json';
import { isJqMessage } from './utils';

/**
 * Applies a JQ filter to the input JSON data using `jq-wasm`.
 * Sends the filtered result or an error back to the parent process.
 *
 * @param message - Contains the JSON data and JQ filter to apply
 */
async function handleJqMessage(message: JqMessage): Promise<void> {
  try {
    // perform jq filtering
    const result = await jq.json(message.jsonData, message.jqScheme);
    // send encoded result back to the parent process
    const response: ProcessResultMessage<object> = {
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
