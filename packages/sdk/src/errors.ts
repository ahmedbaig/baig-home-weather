export const REQUEST_ID_HEADER = 'X-Request-ID';
export const CORRELATION_ID_HEADER = 'X-Correlation-ID';

export interface FieldError {
  field: string;
  rule: string;
  message: string;
}

export interface ErrorItem {
  code: string;
  message: string;
  customerActions?: string[];
  supportActions?: string[];
  fields?: FieldError[];
}

export interface ErrorEnvelope {
  requestId: string;
  correlationId: string;
  errors: ErrorItem[];
}

export interface RequestIds {
  requestId: string;
  correlationId: string;
}

export const NETWORK_ERROR_CODE = 'E0-network';

export class ApiError extends Error {
  override readonly name = 'ApiError';
  readonly status: number;
  readonly code: string;
  readonly fields: FieldError[];
  readonly customerActions: string[];
  readonly supportActions: string[];
  readonly errors: ErrorItem[];
  readonly requestId: string;
  readonly correlationId: string;

  constructor(status: number, errors: ErrorItem[], ids: RequestIds, options?: ErrorOptions) {
    const items = errors.length > 0 ? errors : [fallbackItem(status)];
    const first = items[0] ?? fallbackItem(status);
    super(first.message, options);
    this.status = status;
    this.code = first.code;
    this.fields = items.flatMap((item) => item.fields ?? []);
    this.customerActions = first.customerActions ?? [];
    this.supportActions = first.supportActions ?? [];
    this.errors = items;
    this.requestId = ids.requestId;
    this.correlationId = ids.correlationId;
  }

  fieldError(field: string): string | undefined {
    return this.fields.find((item) => item.field === field)?.message;
  }

  fieldErrors(): Record<string, string> {
    return Object.fromEntries(this.fields.map((item) => [item.field, item.message]));
  }
}

export function fallbackItem(status: number, statusText = ''): ErrorItem {
  return { code: `E${status}-0`, message: statusText || `Request failed with status ${status}` };
}

export function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  if (typeof value !== 'object' || value === null) return false;
  const errors = (value as { errors?: unknown }).errors;
  return (
    Array.isArray(errors) &&
    errors.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as ErrorItem).code === 'string' &&
        typeof (item as ErrorItem).message === 'string'
    )
  );
}

export function readIds(response: Response, sent: RequestIds): RequestIds {
  return {
    requestId: response.headers.get(REQUEST_ID_HEADER) ?? sent.requestId,
    correlationId: response.headers.get(CORRELATION_ID_HEADER) ?? sent.correlationId
  };
}

export async function parseErrorResponse(response: Response, sent: RequestIds): Promise<ApiError> {
  const ids = readIds(response, sent);
  const body: unknown = await response.json().catch(() => null);
  if (!isErrorEnvelope(body)) {
    return new ApiError(response.status, [fallbackItem(response.status, response.statusText)], ids);
  }
  return new ApiError(response.status, body.errors, {
    requestId: body.requestId || ids.requestId,
    correlationId: body.correlationId || ids.correlationId
  });
}

export function networkError(sent: RequestIds, cause: unknown): ApiError {
  return new ApiError(
    0,
    [
      {
        code: NETWORK_ERROR_CODE,
        message: 'Could not reach the server',
        customerActions: ['Check your connection and try again']
      }
    ],
    sent,
    { cause }
  );
}
