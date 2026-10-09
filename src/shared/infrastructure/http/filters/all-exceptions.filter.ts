import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { RequestContextService } from '../../observability/request-context.service.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: PinoLogger,
    private readonly requestContext: RequestContextService,
  ) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const status = this.resolveStatus(exception);
    const requestId = this.requestContext.getRequestId();
    const body = this.buildBody(exception, status, requestId);

    const logPayload = {
      error: exception instanceof Error ? exception.name : 'UnknownError',
      statusCode: status,
      method: request.method,
      path: request.originalUrl,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error({ ...logPayload, err: exception }, this.describe(exception));
    } else {
      this.logger.warn(logPayload, this.describe(exception));
    }

    response.status(status).json(body);
  }

  private resolveStatus(exception: unknown): HttpStatus {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return this.statusFrom(exception) ?? HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private statusFrom(exception: unknown): HttpStatus | undefined {
    const candidate = exception as { status?: unknown; statusCode?: unknown };
    const raw = typeof candidate.status === 'number' ? candidate.status : candidate.statusCode;
    if (typeof raw === 'number' && raw >= 400 && raw <= 599) {
      return raw;
    }
    return undefined;
  }

  private buildBody(
    exception: unknown,
    status: HttpStatus,
    requestId: string | undefined,
  ): Record<string, unknown> {
    if (!(exception instanceof HttpException)) {
      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        return {
          requestId,
          statusCode: status,
          error: 'InternalServerError',
          message: 'Internal server error',
        };
      }

      return {
        requestId,
        statusCode: status,
        error: exception instanceof Error ? exception.name : 'Error',
        message: this.describe(exception),
      };
    }

    const exceptionBody = exception.getResponse();
    if (typeof exceptionBody === 'string') {
      return { requestId, statusCode: status, error: exception.name, message: exceptionBody };
    }

    const body: Record<string, unknown> = { ...exceptionBody };
    if (body.statusCode === undefined) {
      body.statusCode = status;
    }
    body.requestId = requestId;
    return body;
  }

  private describe(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.message;
    }
    return 'Unexpected non-error thrown';
  }
}
