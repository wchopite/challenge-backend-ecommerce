import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import { buildLoggerConfig } from './logger.config.js';
import { RequestIdInterceptor } from './request-id.interceptor.js';
import { resolveRequestId } from './request-id.js';
import { RequestContextService } from './request-context.service.js';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (request) => resolveRequestId(request),
      },
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        buildLoggerConfig({
          level: config.get<string>('app.logLevel', 'info'),
          pretty: config.get<boolean>('app.logPretty', false),
        }),
    }),
  ],
  providers: [RequestContextService, { provide: APP_INTERCEPTOR, useClass: RequestIdInterceptor }],
  exports: [RequestContextService],
})
export class ObservabilityModule {}
