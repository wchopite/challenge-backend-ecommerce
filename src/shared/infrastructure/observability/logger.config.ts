import type { Params } from 'nestjs-pino';
import { resolveRequestId } from './request-id.js';

export interface LoggerConfigOptions {
  level: string;
  pretty: boolean;
}

export function buildLoggerConfig({ level, pretty }: LoggerConfigOptions): Params {
  return {
    pinoHttp: {
      name: 'ecommerce-api',
      level,
      genReqId: (request) => resolveRequestId(request),
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.headers["idempotency-key"]',
          'res.headers["set-cookie"]',
        ],
        remove: true,
      },
      transport: pretty
        ? {
            target: 'pino-pretty',
            options: { singleLine: true, colorize: true, translateTime: 'SYS:standard' },
          }
        : undefined,
    },
  };
}
