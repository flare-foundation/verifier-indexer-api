/**
 * Replaces every URL in text with its scheme and host, dropping path, query and credentials.
 * For log lines and error messages that may quote a URL carrying an API key.
 */
export function redactUrls(text: string): string {
  // The host may be a bracketed IPv6 literal, so brackets are part of a URL here.
  return text.replace(/[a-z][a-z0-9+.-]*:\/\/[^\s"'()<>]+/gi, (match) => {
    try {
      const url = new URL(match);
      return `${url.protocol}//${url.host}/…`;
    } catch {
      return '<url>';
    }
  });
}
