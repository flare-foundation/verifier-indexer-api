import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { redactUrls } from './redact';

/**
 * ConsoleLogger that cuts every URL in a message or stack trace down to scheme and host.
 * Library errors quote request URLs, and RPC URLs carry API keys, so this keeps keys out of
 * every log line, including Nest's own exception logging, without each call site redacting.
 */
export class RedactingLogger extends ConsoleLogger {
  protected override stringifyMessage(
    message: unknown,
    logLevel: LogLevel,
  ): string {
    return redactUrls(String(super.stringifyMessage(message, logLevel)));
  }

  protected override printStackTrace(stack: string): void {
    super.printStackTrace(stack ? redactUrls(stack) : stack);
  }
}
