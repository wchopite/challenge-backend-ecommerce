import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Motive } from '../../../domain/motive/motive.js';

export class RegisterStockMovementDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsIn(Object.values(Motive))
  motive: Motive;
}
