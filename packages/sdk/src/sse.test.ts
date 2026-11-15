import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EventStream, backoffDelay, type EventSourceLike } from './sse.svelte';

class FakeEventSource implements EventSourceLike {
  static instances: FakeEventSource[] = [];
  readyState = 0;
  onopen: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  closed = false;
  readonly listeners = new Map<string, ((event: MessageEvent<string>) => void)[]>();

  constructor(
    readonly url: string,
    readonly init: EventSourceInit
  ) {
    FakeEventSource.instances.push(this);
  }

  static latest(): FakeEventSource {
    const latest = FakeEventSource.instances.at(-1);
    if (!latest) throw new Error('no event source created');
    return latest;
  }

  addEventListener(type: string, listener: (event: MessageEvent<string>) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  close(): void {
    this.closed = true;
    this.readyState = 2;
  }

  open(): void {
    this.readyState = 1;
    this.onopen?.(new Event('open'));
  }

  emit(type: string, data: unknown, lastEventId: string): void {
    const event = new MessageEvent(type, { data: JSON.stringify(data), lastEventId });
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }

  fail(readyState: number): void {
    this.readyState = readyState;
    this.onerror?.(new Event('error'));
  }
}

type Events = { 'posts.created': { title: string }; 'posts.deleted': { id: string } };

function createStream() {
  return new EventStream<Events>({
    baseUrl: 'https://api.example.test',
    topics: ['posts', 'alerts'],
    backoff: { initialMs: 100, maxMs: 400 },
    createEventSource: (url, init) => new FakeEventSource(url, init)
  });
}

describe('EventStream', () => {
  beforeEach(() => {
    FakeEventSource.instances = [];
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('subscribes by topic with credentials and reports status', () => {
    const stream = createStream();
    const source = FakeEventSource.latest();

    expect(source.url).toBe('https://api.example.test/api/v1/events?topics=posts%2Calerts');
    expect(source.init.withCredentials).toBe(true);
    expect(stream.status).toBe('connecting');

    source.open();
    expect(stream.status).toBe('open');
  });

  it('dispatches typed envelopes to handlers and tracks the last event id', () => {
    const stream = createStream();
    const created = vi.fn();
    const deleted = vi.fn();
    stream.on('posts.created', created);
    stream.on('posts.deleted', deleted);

    const envelope = {
      topic: 'posts',
      type: 'posts.created',
      id: 'p1',
      data: { title: 'Hello' },
      correlationId: 'corr-1',
      at: '2026-01-01T00:00:00Z'
    };
    FakeEventSource.latest().emit('posts.created', envelope, '1700000000000-0');

    expect(created).toHaveBeenCalledWith(envelope);
    expect(deleted).not.toHaveBeenCalled();
    expect(stream.lastEventId).toBe('1700000000000-0');
  });

  it('stops calling a handler after it unsubscribes', () => {
    const stream = createStream();
    const handler = vi.fn();
    const off = stream.on('posts.created', handler);
    off();

    FakeEventSource.latest().emit('posts.created', { data: {} }, '1');

    expect(handler).not.toHaveBeenCalled();
  });

  it('stays connecting while the browser retries on its own', () => {
    const stream = createStream();
    const source = FakeEventSource.latest();
    source.open();

    source.fail(0);

    expect(stream.status).toBe('connecting');
    expect(FakeEventSource.instances).toHaveLength(1);
  });

  it('reconnects with backoff when the source closes and keeps handlers', () => {
    const stream = createStream();
    const handler = vi.fn();
    stream.on('posts.created', handler);

    FakeEventSource.latest().fail(2);
    expect(stream.status).toBe('closed');
    vi.advanceTimersByTime(99);
    expect(FakeEventSource.instances).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(FakeEventSource.instances).toHaveLength(2);
    expect(stream.status).toBe('connecting');

    FakeEventSource.latest().fail(2);
    vi.advanceTimersByTime(199);
    expect(FakeEventSource.instances).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(FakeEventSource.instances).toHaveLength(3);

    FakeEventSource.latest().open();
    expect(stream.attempt).toBe(0);
    FakeEventSource.latest().emit('posts.created', { data: { title: 'again' } }, '2');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('closes cleanly and never reconnects afterwards', () => {
    const stream = createStream();
    const source = FakeEventSource.latest();

    stream.close();
    source.fail(2);
    vi.runAllTimers();

    expect(source.closed).toBe(true);
    expect(stream.status).toBe('closed');
    expect(FakeEventSource.instances).toHaveLength(1);
  });
});

describe('backoffDelay', () => {
  it('doubles up to the maximum', () => {
    const options = { initialMs: 1000, maxMs: 30000 };
    expect([0, 1, 2, 5, 10].map((attempt) => backoffDelay(attempt, options))).toEqual([
      1000, 2000, 4000, 30000, 30000
    ]);
  });
});
