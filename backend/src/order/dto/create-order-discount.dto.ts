import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDiscountDto {
  @ApiProperty({ description: 'ID của chương trình giảm giá (discount_id)', example: 1 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  discount_id: number;

  // discount_amount sẽ được tính toán bởi service dựa trên thông tin của Discount và Order
} 