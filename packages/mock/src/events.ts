import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { header } from './http.ts';

export interface StoredEvent {
  streamId: string;
  topic: string;
  type: string;
  payload: string;
}

interface Client {
  res: ServerResponse;
  topics: Set<string>;
}

export function createEventHub({ pingMs = 15_000, historySize = 200 } = {}) {
  const clients = new Set<Client>();
  const history: StoredEvent[] = [];
  let sequence = 0;
  let lastMs = 0;

  function nextStreamId(): string {
    const ms = Date.now();
    sequence = ms === lastMs ? sequence + 1 : 0;
    lastMs = ms;
    return `${ms}-${sequence}`;
  }

  function write(res: ServerResponse, event: StoredEvent): void {
    res.write(`event: ${event.type}\nid: ${event.streamId}\ndata: ${event.payload}\n\n`);
  }

  function isAfter(streamId: string, lastId: string): boolean {
    const [ms = 0, seq = 0] = streamId.split('-').map(Number);
    const [lastMs = 0, lastSeq = 0] = lastId.split('-').map(Number);
    return ms > lastMs || (ms === lastMs && seq > lastSeq);
  }

  return {
    get size() {
      return clients.size;
    },

    publish(topic: string, type: string, data: unknown, correlationId: string): void {
      const envelope = {
        topic,
        type,
        id: randomUUID(),
        data,
        correlationId,
        at: new Date().toISOString()
      };
      const event: StoredEvent = {
        streamId: nextStreamId(),
        topic,
        type,
        payload: JSON.stringify(envelope)
      };
      history.push(event);
      if (history.length > historySize) history.shift();
      for (const client of clients) if (client.topics.has(topic)) write(client.res, event);
    },

    subscribe(req: IncomingMessage, res: ServerResponse, topics: string[]): void {
      const client: Client = { res, topics: new Set(topics) };
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
      });
      res.write('retry: 2000\n\n');

      const lastEventId = header(req, 'last-event-id');
      if (lastEventId) {
        history
          .filter((event) => client.topics.has(event.topic) && isAfter(event.streamId, lastEventId))
          .forEach((event) => write(res, event));
      }

      clients.add(client);
      const ping = setInterval(() => res.write(': ping\n\n'), pingMs);
      req.on('close', () => {
        clearInterval(ping);
        clients.delete(client);
      });
    }
  };
}

export type EventHub = ReturnType<typeof createEventHub>;
