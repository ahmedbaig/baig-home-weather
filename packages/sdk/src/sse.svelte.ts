import { buildUrl } from './client';

export const EVENTS_PATH = '/api/v1/events';

export type StreamStatus = 'connecting' | 'open' | 'closed';

export interface SseEnvelope<T = unknown> {
  topic: string;
  type: string;
  id: string;
  data: T;
  correlationId: string;
  at: string;
}

export type EventHandler<T> = (event: SseEnvelope<T>) => void;

export interface EventSourceLike {
  readonly readyState: number;
  onopen: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
  addEventListener(type: string, listener: (event: MessageEvent<string>) => void): void;
  close(): void;
}

export type EventSourceFactory = (url: string, init: EventSourceInit) => EventSourceLike;

export interface BackoffOptions {
  initialMs: number;
  maxMs: number;
}

export interface EventStreamOptions {
  baseUrl?: string;
  topics: string[];
  withCredentials?: boolean;
  backoff?: BackoffOptions;
  createEventSource?: EventSourceFactory;
}

const CLOSED = 2;

export function backoffDelay(attempt: number, { initialMs, maxMs }: BackoffOptions): number {
  return Math.min(maxMs, initialMs * 2 ** attempt);
}

export class EventStream<Events extends Record<string, unknown> = Record<string, unknown>> {
  status = $state<StreamStatus>('connecting');
  lastEventId = $state<string | null>(null);
  attempt = $state(0);

  readonly url: string;
  readonly #handlers = new Map<string, Set<EventHandler<never>>>();
  readonly #listeners = new Map<string, (event: MessageEvent<string>) => void>();
  readonly #create: EventSourceFactory;
  readonly #withCredentials: boolean;
  readonly #backoff: BackoffOptions;
  #source: EventSourceLike | null = null;
  #timer: ReturnType<typeof setTimeout> | undefined;
  #stopped = false;

  constructor(options: EventStreamOptions) {
    this.url = buildUrl(options.baseUrl ?? '', EVENTS_PATH, { topics: options.topics.join(',') });
    this.#create = options.createEventSource ?? ((url, init) => new EventSource(url, init));
    this.#withCredentials = options.withCredentials ?? true;
    this.#backoff = options.backoff ?? { initialMs: 1000, maxMs: 30000 };
    this.#connect();
  }

  on<K extends keyof Events & string>(type: K, handler: EventHandler<Events[K]>): () => void {
    let handlers = this.#handlers.get(type);
    if (!handlers) {
      handlers = new Set();
      this.#handlers.set(type, handlers);
      this.#listen(type);
    }
    handlers.add(handler);
    return () => handlers.delete(handler);
  }

  close(): void {
    this.#stopped = true;
    clearTimeout(this.#timer);
    this.#source?.close();
    this.#source = null;
    this.status = 'closed';
  }

  #listen(type: string): void {
    const listener = (event: MessageEvent<string>) => this.#dispatch(type, event);
    this.#listeners.set(type, listener);
    this.#source?.addEventListener(type, listener);
  }

  #dispatch(type: string, event: MessageEvent<string>): void {
    if (event.lastEventId) this.lastEventId = event.lastEventId;
    let envelope: SseEnvelope<never>;
    try {
      envelope = JSON.parse(event.data);
    } catch {
      return;
    }
    for (const handler of this.#handlers.get(type) ?? []) handler(envelope);
  }

  #connect(): void {
    if (this.#stopped) return;
    this.status = 'connecting';
    const source = this.#create(this.url, { withCredentials: this.#withCredentials });
    this.#source = source;
    for (const [type, listener] of this.#listeners) source.addEventListener(type, listener);
    source.onopen = () => {
      this.attempt = 0;
      this.status = 'open';
    };
    source.onerror = () => {
      if (this.#stopped || source !== this.#source) return;
      if (source.readyState === CLOSED) {
        source.close();
        this.#retry();
        return;
      }
      this.status = 'connecting';
    };
  }

  #retry(): void {
    this.status = 'closed';
    const delay = backoffDelay(this.attempt, this.#backoff);
    this.attempt += 1;
    this.#timer = setTimeout(() => this.#connect(), delay);
  }
}
