import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'VariantNotFoundError', description: 'Error name' })
  error: string;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'Variant not found for SKU UNKNOWN',
  })
  message: string | string[];

  @ApiProperty({
    example: 'd3b07384-d9a1-4c3b-9f2e-9c1a2b3c4d5e',
    description: 'Correlation id (echoed from the x-request-id header or generated)',
  })
  requestId: string;
}
