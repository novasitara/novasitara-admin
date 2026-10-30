/**
 * Calls the Nova Sitara API. Requests go to /api on the same origin
 * (Vite proxies it in development, Nginx in production), so the session cookie is sent automatically.
 * Throws an Error with the server's message when the request fails.
 */
export async function api<T = unknown>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const isForm = options.body instanceof FormData;
  const res = await fetch(`/api${path}`, {
    method: options.method ?? (options.body === undefined ? 'GET' : 'POST'),
    headers: options.body === undefined || isForm ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? (options.body as FormData) : options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    // Session expired while a page was open: go back to the login screen (sign-in itself also returns 401).
    if (res.status === 401 && !path.startsWith('/auth/')) window.location.assign('/login');
    const message = Array.isArray(data?.message) ? data.message.join('. ') : data?.message;
    throw new Error(message || `Request failed (${res.status})`);
  }
  return data as T;
}

/** Runs a request and returns its error message instead of throwing ('' when it worked). */
export async function attempt(run: () => Promise<unknown>): Promise<string> {
  try {
    await run();
    return '';
  } catch (e) {
    return e instanceof Error ? e.message : 'Something went wrong';
  }
}
