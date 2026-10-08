import { randomUUID } from 'node:crypto';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../shared/infrastructure/http/dto/error-response.dto.js';
import {
  GET_VARIANT_AVAILABILITY,
  type GetVariantAvailability,
} from '../../domain/ports/in/get-variant-availability.js';
import {
  REGISTER_STOCK_MOVEMENT,
  type RegisterStockMovement,
} from '../../domain/ports/in/register-stock-movement.js';
import { RegisterStockMovementDto } from './dto/register-stock-movement.dto.js';
import { StockMovementResponseDto } from './dto/stock-movement-response.dto.js';
import { VariantAvailabilityResponseDto } from './dto/variant-availability-response.dto.js';

@ApiTags('stock')
@Controller('stock')
export class StockController {
  constructor(
    @Inject(REGISTER_STOCK_MOVEMENT) private readonly registerMovement: RegisterStockMovement,
    @Inject(GET_VARIANT_AVAILABILITY) private readonly getAvailability: GetVariantAvailability,
  ) {}

  @Post('movimientos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a stock movement (inbound or outbound)' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Optional. Repeating the same key does not duplicate the movement (409).',
  })
  @ApiResponse({
    status: 201,
    description: 'Movement registered',
    type: StockMovementResponseDto,
    headers: { 'x-request-id': { description: 'Correlation id', schema: { type: 'string' } } },
  })
  @ApiResponse({ status: 400, description: 'Invalid payload', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Variant not found', type: ErrorResponseDto })
  @ApiResponse({
    status: 409,
    description: 'Insufficient stock or duplicated idempotency key',
    type: ErrorResponseDto,
  })
  register(
    @Body() dto: RegisterStockMovementDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<StockMovementResponseDto> {
    return this.registerMovement.execute({
      sku: dto.sku,
      quantity: dto.quantity,
      motive: dto.motive,
      idempotencyKey: idempotencyKey?.trim() || randomUUID(),
    });
  }

  @Get('variants/:sku')
  @ApiOperation({ summary: 'Get the available stock for a variant' })
  @ApiParam({ name: 'sku', description: 'Variant SKU', example: 'RUN-42-BLACK' })
  @ApiResponse({
    status: 200,
    description: 'Availability',
    type: VariantAvailabilityResponseDto,
    headers: { 'x-request-id': { description: 'Correlation id', schema: { type: 'string' } } },
  })
  @ApiResponse({ status: 404, description: 'Variant not found', type: ErrorResponseDto })
  availability(@Param('sku') sku: string): Promise<VariantAvailabilityResponseDto> {
    return this.getAvailability.execute(sku);
  }
}
