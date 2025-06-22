import {
  IsInt,
  IsNotEmpty,
  Min,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  ArrayNotEmpty,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderProductDto } from './create-order-product.dto';
import { CreateOrderDiscountDto } from './create-order-discount.dto';

export class CreateOrderDto {
  @ApiProperty({ description: 'ID của nhân viên tạo đơn', example: 1 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  employee_id: number;

  @ApiProperty({
    description: 'ID của khách hàng (nếu có)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  customer_id?: number;

  @ApiProperty({
    description: 'Ghi chú tùy chỉnh cho toàn bộ đơn hàng',
    example: 'Giao hàng sau 5 giờ chiều',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  customize_note?: string;

  @ApiProperty({
    description: 'Danh sách sản phẩm trong đơn hàng',
    type: [CreateOrderProductDto],
    minItems: 1,
  })
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderProductDto)
  products: CreateOrderProductDto[];

  @ApiProperty({
    description: 'Danh sách mã giảm giá áp dụng cho đơn hàng',
    type: [CreateOrderDiscountDto],
    required: false,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDiscountDto)
  discounts?: CreateOrderDiscountDto[];

  // status sẽ được service quản lý, mặc định là PROCESSING

  // order_time, total_amount, final_amount sẽ được service tính toán và thiết lập.
}
