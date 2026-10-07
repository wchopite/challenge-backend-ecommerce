import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { RequestContextService } from './request-context.service.js';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  constructor(private readonly requestContext: RequestContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<Response>();
    const requestId = this.requestContext.getRequestId();

    if (requestId !== undefined) {
      response.setHeader('x-request-id', requestId);
    }

    return next.handle();
  }
}
