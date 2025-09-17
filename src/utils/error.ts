export function asError(e: unknown): Error {
  if (e instanceof Error) {
    return e;
  } else {
    throw new Error(`Unknown object thrown as error: ${JSON.stringify(e)}`);
  }
}

/** Returns error message including stack trace. */
export function errorString(e: unknown): string {
  if (e instanceof Error) {
    return e.message + e.stack ? `\n${e.stack}` : '';
  } else {
    return `Caught a non-error objet: ${JSON.stringify(e)}`;
  }
}
