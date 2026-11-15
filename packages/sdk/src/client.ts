import {
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
  networkError,
  parseErrorResponse,
  readIds,
  type RequestIds
} from './errors';
import { pageCorrelationId, uuidv7 } from './ids';

export type Query = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  query?: Query;
  body?: unknown;
  correlationId?: string;
  signal?: AbortSignal;
}

export interface ApiResponse<T> extends RequestIds {
  status: number;
  data: T;
}

export interface ApiClientOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
  correlationId?: string;
  requestId?: () => string;
}

export interface ApiClient {
  readonly baseUrl: string;
  send<T>(method: string, path: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  delete<T = void>(path: string, options?: RequestOptions): Promise<T>;
}

export function buildUrl(baseUrl: string, path: string, query: Query = {}): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return `${baseUrl.replace(/\/+$/, '')}${path}${qs ? `?${qs}` : ''}`;
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const baseUrl = options.baseUrl ?? '';
  const doFetch = options.fetch ?? ((input, init) => fetch(input, init));
  const nextRequestId = options.requestId ?? (() => uuidv7());
  const defaultCorrelationId = options.correlationId ?? pageCorrelationId;

  async function send<T>(
    method: string,
    path: string,
    request: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const sent: RequestIds = {
      requestId: nextRequestId(),
      correlationId: request.correlationId ?? defaultCorrelationId
    };
    const headers = new Headers({
      Accept: 'application/json',
      [REQUEST_ID_HEADER]: sent.requestId,
      [CORRELATION_ID_HEADER]: sent.correlationId
    });
    if (request.body !== undefined) headers.set('Content-Type', 'application/json');

    let response: Response;
    try {
      response = await doFetch(buildUrl(baseUrl, path, request.query), {
        method,
        headers,
        credentials: 'include',
        body: request.body === undefined ? undefined : JSON.stringify(request.body),
        signal: request.signal
      });
    } catch (error) {
      if (isAbort(error)) throw error;
      throw networkError(sent, error);
    }

    if (!response.ok) throw await parseErrorResponse(response, sent);
    const data = (await readBody(response)) as T;
    return { status: response.status, data, ...readIds(response, sent) };
  }

  return {
    baseUrl,
    send,
    get: (path, request) => send<never>('GET', path, request).then((r) => r.data),
    post: (path, body, request) =>
      send<never>('POST', path, { ...request, body }).then((r) => r.data),
    patch: (path, body, request) =>
      send<never>('PATCH', path, { ...request, body }).then((r) => r.data),
    delete: (path, request) => send<never>('DELETE', path, request).then((r) => r.data)
  };
}
