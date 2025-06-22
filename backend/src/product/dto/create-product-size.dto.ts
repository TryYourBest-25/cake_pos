import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductSizeForProductDto {
  @ApiProperty({
    description: 'Tên kích thước sản phẩm',
    example: 'S',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string; // e.g., "S", "M", "L", "10 inch"

  @ApiProperty({
    description: 'Đơn vị đo lường',
    example: 'inch',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unit: string; // e.g., "cái", "phần", "inch", "cm"

  @ApiProperty({
    description: 'Số lượng/kích thước',
    example: 10,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number; // e.g., if name="10 inch", unit="inch", then quantity=10

  @ApiProperty({
    description: 'Mô tả kích thước sản phẩm',
    example: 'Bánh kích thước 10 inch phù hợp cho 8-10 người',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
