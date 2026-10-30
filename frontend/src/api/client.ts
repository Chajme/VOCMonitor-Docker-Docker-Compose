import type { ApiMessage } from "./types";

export interface ApiSuccess<T> {
  ok: true;
  status: number;
  data: T;
}

export interface ApiFailure {
  ok: false;
  status: number;
  data: ApiMessage | null;
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

/**
 * Read a response body as JSON.
 *
 * Empty bodies become `null`; malformed JSON throws (that is a programming or
 * proxy error, not an expected API outcome).
 */
async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) {
    return null;
  }
  return JSON.parse(text) as unknown;
}

/**
 * Perform a request and normalise the result.
 *
 * Expected HTTP statuses (including 404/409/500 responses that carry a
 * `{ message }` body) are returned, not thrown. Network failures and malformed
 * JSON reject.
 */
async function request<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  const response = await fetch(url, init);
  const body = await readJson(response);

  if (response.ok) {
    return { ok: true, status: response.status, data: body as T };
  }

  return { ok: false, status: response.status, data: body as ApiMessage | null };
}

export function apiGet<T>(url: string): Promise<ApiResult<T>> {
  return request<T>(url, { method: "GET" });
}

export function apiPostJson<T>(url: string, body: unknown = {}): Promise<ApiResult<T>> {
  return request<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Send a form-encoded body.
 *
 * `URLSearchParams` and `FormData` both set their own Content-Type, so we must
 * not set one here (in particular FormData needs the multipart boundary).
 */
export function apiPostForm<T>(
  url: string,
  body: URLSearchParams | FormData,
): Promise<ApiResult<T>> {
  return request<T>(url, { method: "POST", body });
}
