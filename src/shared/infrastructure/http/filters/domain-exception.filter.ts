import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainError, type DomainErrorCode } from '../../../domain/errors/domain.error.js';

const STATUS_BY_CODE: Record<DomainErrorCode, number> = {
  NOT_FOUND: HttpStatus.NOT_FOUND,
  CONFLICT: HttpStatus.CONFLICT,
  INVALID_ARGUMENT: HttpStatus.BAD_REQUEST,
};

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = STATUS_BY_CODE[exception.code];

    this.logger.warn(`${exception.name}: ${exception.message}`);

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }
}
