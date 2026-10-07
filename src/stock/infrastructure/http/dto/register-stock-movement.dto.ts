import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Motive } from '../../../domain/motive/motive.js';

export class RegisterStockMovementDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(Motive)
  motive: Motive;
}
