import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Motive } from '../../../domain/motive/motive.js';

export class RegisterStockMovementDto {
  @ApiProperty({ example: 'RUN-42-BLACK', description: 'Variant SKU' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 5, minimum: 1, description: 'Positive number of units' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ enum: Object.values(Motive), example: Motive.PURCHASE })
  @IsIn(Object.values(Motive))
  motive: Motive;
}
