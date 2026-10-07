import { readFileSync } from 'node:fs';
import { hostname } from 'node:os';
import { join } from 'node:path';
import type { Params } from 'nestjs-pino';
import { resolveRequestId } from './request-id.js';

const SERVICE_NAME = 'ecommerce-api';
const IGNORED_LOG_PATHS = ['/health', '/docs'];

const { version } = JSON.parse(
  readFileSync(join(import.meta.dirname, '../../../../package.json'), 'utf8'),
) as { version: string };

export interface LoggerConfigOptions {
  level: string;
  env: string;
  pretty: boolean;
}

export function buildLoggerConfig({ level, env, pretty }: LoggerConfigOptions): Params {
  return {
    pinoHttp: {
      name: SERVICE_NAME,
      level,
      base: { service: SERVICE_NAME, env, version, pid: process.pid, hostname: hostname() },
      genReqId: (request) => resolveRequestId(request),
      customAttributeKeys: { reqId: 'requestId' },
      quietReqLogger: true,
      autoLogging: {
        ignore: (request) => {
          const url = request.url;
          return url !== undefined && IGNORED_LOG_PATHS.some((prefix) => url.startsWith(prefix));
        },
      },
      customLogLevel: (_request, response, error) => {
        if (error !== undefined || response.statusCode >= 500) {
          return 'error';
        }
        return response.statusCode >= 400 ? 'warn' : 'info';
      },
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
