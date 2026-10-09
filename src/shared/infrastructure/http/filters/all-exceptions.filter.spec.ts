import { type ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { jest } from '@jest/globals';
import type { PinoLogger } from 'nestjs-pino';
import type { RequestContextService } from '../../observability/request-context.service.js';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

class PayloadTooLargeError extends Error {
  readonly statusCode = HttpStatus.PAYLOAD_TOO_LARGE;

  constructor() {
    super('request entity too large');
    this.name = 'PayloadTooLargeError';
  }
}

describe('AllExceptionsFilter', () => {
  const request = { method: 'POST', originalUrl: '/stock/movimientos' };
  let response: { status: jest.Mock; json: jest.Mock };
  let logger: { setContext: jest.Mock; warn: jest.Mock; error: jest.Mock };
  let host: ArgumentsHost;
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    response = { status: jest.fn(), json: jest.fn() };
    response.status.mockReturnValue(response);
    host = {
      switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
    } as unknown as ArgumentsHost;
    logger = { setContext: jest.fn(), warn: jest.fn(), error: jest.fn() };
    filter = new AllExceptionsFilter(
      logger as unknown as PinoLogger,
      { getRequestId: () => 'req-1' } as unknown as RequestContextService,
    );
  });

  it('preserves an HttpException body and adds the request id', () => {
    filter.catch(
      new BadRequestException({ statusCode: 400, message: ['bad'], error: 'Bad Request' }),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: ['bad'],
      error: 'Bad Request',
      requestId: 'req-1',
    });
    expect(logger.warn).toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('honors a non-Http exception status (e.g. body-parser 413)', () => {
    filter.catch(new PayloadTooLargeError(), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.PAYLOAD_TOO_LARGE);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 413,
      error: 'PayloadTooLargeError',
      message: 'request entity too large',
      requestId: 'req-1',
    });
    expect(logger.warn).toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('returns a generic 500 for an unexpected error and logs it with the stack', () => {
    const error = new Error('boom');
    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'InternalServerError',
      message: 'Internal server error',
      requestId: 'req-1',
    });
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Error', statusCode: 500, err: error }),
      'boom',
    );
  });
});
