import {
  BadRequestException,
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

@Controller('stock')
export class StockController {
  constructor(
    @Inject(REGISTER_STOCK_MOVEMENT) private readonly registerMovement: RegisterStockMovement,
    @Inject(GET_VARIANT_AVAILABILITY) private readonly getAvailability: GetVariantAvailability,
  ) {}

  @Post('movimientos')
  @HttpCode(HttpStatus.CREATED)
  register(
    @Body() dto: RegisterStockMovementDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<StockMovementResponseDto> {
    if (idempotencyKey === undefined || idempotencyKey.trim() === '') {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    return this.registerMovement.execute({
      sku: dto.sku,
      quantity: dto.quantity,
      motive: dto.motive,
      idempotencyKey,
    });
  }

  @Get('variants/:sku')
  availability(@Param('sku') sku: string): Promise<VariantAvailabilityResponseDto> {
    return this.getAvailability.execute(sku);
  }
}
