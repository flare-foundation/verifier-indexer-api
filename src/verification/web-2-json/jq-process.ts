import * as jq from 'jq-wasm';
import {
  JqErrorMessage,
  JqMessage,
  JqResultMessage,
} from 'src/config/interfaces/web2Json';

async function handleJqMessage(message: JqMessage): Promise<void> {
  try {
    const result = await jq.json(message.jsonData, message.jqScheme);
    const response: JqResultMessage = {
      status: 'success',
      result,
    };
    process.send(response);
  } catch (error) {
    const errorResponse: JqErrorMessage = {
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
    process.send(errorResponse);
  }
}

process.on('message', (message: JqMessage) => {
  handleJqMessage(message).catch((error) => {
    console.error('Error handling jq message:', error);
  });
});
