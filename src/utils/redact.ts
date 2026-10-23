/**
 * Replaces every URL in text with its scheme and host, dropping path, query and credentials.
 * Appends "/…" only when something was dropped.
 * For log lines and error messages that may quote a URL carrying an API key.
 */
export function redactUrls(text: string): string {
  // The host may be a bracketed IPv6 literal, so brackets are part of a URL here.
  // Control characters end a URL, so a trailing ANSI colour code stays out of the match.
  return text.replace(
    /[a-z][a-z0-9+.-]*:\/\/[^\s"'()<>\p{Cc}]+/giu,
    (match) => {
      try {
        const url = new URL(match);
        const dropped =
          url.username !== '' ||
          url.password !== '' ||
          (url.pathname !== '' && url.pathname !== '/') ||
          url.search !== '' ||
          url.hash !== '';
        return `${url.protocol}//${url.host}${dropped ? '/…' : ''}`;
      } catch {
        return '<url>';
      }
    },
  );
}
