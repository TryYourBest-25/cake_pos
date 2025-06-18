import {
  IsInt,
  IsNotEmpty,
  Min,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderProductDto {
  @ApiProperty({
    description: 'ID của giá sản phẩm (product_price_id)',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  product_price_id: number;

  @ApiProperty({ description: 'Số lượng sản phẩm', example: 2, minimum: 1 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    description: 'Ghi chú tùy chọn cho sản phẩm trong đơn hàng',
    example: 'Ít đường',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  option?: string;
}
