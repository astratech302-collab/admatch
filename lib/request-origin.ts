/** Next.js may construct request.url with an internal hostname (localhost),
 * even when the browser accessed 127.0.0.1. Compare against the incoming Host,
 * not an internal server URL. Never accept arbitrary forwarded host headers.
 */
export function isSameOriginRequest(request: Request): boolean {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = request.headers.get('origin');
  // Non-browser local tools may omit Origin. Browser mutations send it.
  if (!origin) return true;
  try {
    const url = new URL(request.url);
    const host = request.headers.get('host');
    const expected = host ? new URL(`${url.protocol}//${host}`).origin : url.origin;
    const incoming = new URL(origin);
    return ['http:', 'https:'].includes(incoming.protocol)
      && origin === incoming.origin
      && incoming.origin === expected;
  } catch {
    return false;
  }
}
