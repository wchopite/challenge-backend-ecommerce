import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { DomainError, DomainErrorCode } from '../../../domain/errors/domain.error.js';
import { RequestContextService } from '../../observability/request-context.service.js';

const STATUS_BY_CODE: Record<DomainErrorCode, HttpStatus> = {
  [DomainErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [DomainErrorCode.CONFLICT]: HttpStatus.CONFLICT,
  [DomainErrorCode.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
};

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: PinoLogger,
    private readonly requestContext: RequestContextService,
  ) {
    this.logger.setContext(DomainExceptionFilter.name);
  }

  catch(exception: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = STATUS_BY_CODE[exception.code];

    const payload = {
      requestId: this.requestContext.getRequestId(),
      error: exception.name,
      code: exception.code,
      statusCode: status,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(payload, exception.message);
    } else {
      this.logger.warn(payload, exception.message);
    }

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }
}
