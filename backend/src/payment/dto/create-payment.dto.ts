import {
  IsInt,
  IsNotEmpty,
  Min,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID của đơn hàng liên quan', example: 1 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  order_id: number;

  @ApiProperty({ description: 'ID của phương thức thanh toán', example: 1 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  payment_method_id: number;

  @ApiProperty({ description: 'Số tiền khách hàng trả', example: 150000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  amount_paid: number;

  @ApiProperty({
    description:
      'Thời gian thanh toán (ISO 8601 string), mặc định là thời điểm hiện tại nếu không cung cấp',
    example: '2024-07-26T10:30:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  payment_time?: string;
}
