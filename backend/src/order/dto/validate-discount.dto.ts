import { IsInt, IsArray, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateDiscountDto {
  @ApiProperty({
    description: 'ID của khách hàng (có thể null)',
    example: 1,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'customer_id phải là số nguyên' })
  customer_id?: number;

  @ApiProperty({
    description: 'Danh sách ID của các discount cần kiểm tra',
    example: [1, 2],
    type: [Number],
  })
  @IsArray({ message: 'discount_ids phải là mảng' })
  @IsInt({ each: true, message: 'Mỗi discount_id phải là số nguyên' })
  discount_ids: number[];

  @ApiProperty({
    description: 'Tổng số tiền của đơn hàng (VND)',
    example: 250000,
    minimum: 0,
    type: Number,
  })
  @IsInt({ message: 'total_amount phải là số nguyên' })
  @Min(0, { message: 'total_amount phải lớn hơn hoặc bằng 0' })
  total_amount: number;

  @ApiProperty({
    description: 'Số lượng sản phẩm trong đơn hàng',
    example: 3,
    minimum: 1,
    type: Number,
  })
  @IsInt({ message: 'product_count phải là số nguyên' })
  @Min(1, { message: 'product_count phải lớn hơn 0' })
  product_count: number;
} 