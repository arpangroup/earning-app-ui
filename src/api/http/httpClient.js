import { env } from '../../config/env';
import { ApiError, ErrorCodes } from '../errors';
import { AUTH_EXPIRED_EVENT, session } from '../session';

/**
 * Thin fetch wrapper: base URL, auth header, timeout, JSON, error normalisation.
 * Adjust here if the backend uses a different envelope (e.g. `{ data, error }`).
 */
async function request(path, { method = 'GET', body, query, auth = true, headers = {}, signal } = {}) {
  const url = new URL(env.apiBaseUrl + path, window.location.origin);
  Object.entries(query || {}).forEach(([k, v]) => v !== undefined && v !== null && url.searchParams.set(k, v));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), env.apiTimeoutMs);
  signal?.addEventListener('abort', () => controller.abort());

  const token = session.getToken();
  let res;
  try {
    res = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(auth && token && { Authorization: `Bearer ${token}` }),
        'X-App-Env': env.name,
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    const timedOut = controller.signal.reason === 'timeout';
    throw new ApiError(timedOut ? 'Request timed out' : 'Network error — check your connection', {
      code: timedOut ? ErrorCodes.TIMEOUT : ErrorCodes.NETWORK,
      details: err,
    });
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (res.status === 401 && auth) {
    session.clear();
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
  if (!res.ok) {
    throw new ApiError(data?.message || res.statusText || 'Something went wrong', {
      status: res.status,
      code: data?.code || (res.status === 401 ? ErrorCodes.UNAUTHORIZED : `HTTP_${res.status}`),
      details: data,
    });
  }
  return data;
}

export const http = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};
