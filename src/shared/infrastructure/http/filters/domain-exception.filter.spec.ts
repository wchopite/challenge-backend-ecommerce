import { type ArgumentsHost, HttpStatus } from '@nestjs/common';
import { jest } from '@jest/globals';
import type { PinoLogger } from 'nestjs-pino';
import { DomainError, DomainErrorCode } from '../../../domain/errors/domain.error.js';
import type { RequestContextService } from '../../observability/request-context.service.js';
import { DomainExceptionFilter } from './domain-exception.filter.js';

class TestConflictError extends DomainError {
  constructor() {
    super('boom', DomainErrorCode.CONFLICT, { sku: 'SKU-1', motive: 'SALE' });
  }
}

class TestNotFoundError extends DomainError {
  constructor() {
    super('nope', DomainErrorCode.NOT_FOUND, { sku: 'NOPE' });
  }
}

describe('DomainExceptionFilter', () => {
  const request = { method: 'POST', originalUrl: '/stock/movimientos' };
  let response: { status: jest.Mock; json: jest.Mock };
  let logger: { setContext: jest.Mock; warn: jest.Mock; error: jest.Mock };
  let host: ArgumentsHost;
  let filter: DomainExceptionFilter;

  beforeEach(() => {
    response = { status: jest.fn(), json: jest.fn() };
    response.status.mockReturnValue(response);
    host = {
      switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
    } as unknown as ArgumentsHost;
    logger = { setContext: jest.fn(), warn: jest.fn(), error: jest.fn() };
    filter = new DomainExceptionFilter(
      logger as unknown as PinoLogger,
      { getRequestId: () => 'req-1' } as unknown as RequestContextService,
    );
  });

  it('maps a conflict to 409 and logs method, path and error details', () => {
    filter.catch(new TestConflictError(), host);

    expect(logger.warn).toHaveBeenCalledWith(
      {
        error: 'TestConflictError',
        code: DomainErrorCode.CONFLICT,
        statusCode: HttpStatus.CONFLICT,
        method: 'POST',
        path: '/stock/movimientos',
        sku: 'SKU-1',
        motive: 'SALE',
      },
      'boom',
    );
    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      error: 'TestConflictError',
      message: 'boom',
      requestId: 'req-1',
    });
  });

  it('maps a not-found error to 404 and includes its details', () => {
    filter.catch(new TestNotFoundError(), host);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        code: DomainErrorCode.NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
        sku: 'NOPE',
      }),
      'nope',
    );
    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });
});
