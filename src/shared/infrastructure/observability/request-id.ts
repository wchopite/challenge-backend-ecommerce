import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

export function resolveRequestId(req: IncomingMessage): string {
  const header = req.headers['x-request-id'];
  if (typeof header === 'string' && header.length > 0) {
    return header;
  }

  const existing = (req as IncomingMessage & { id?: unknown }).id;
  if (typeof existing === 'string' && existing.length > 0) {
    return existing;
  }

  const id = randomUUID();
  (req as IncomingMessage & { id?: string }).id = id;
  return id;
}
