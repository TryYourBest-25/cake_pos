import { IsInt, IsNotEmpty, Min, IsOptional, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVNPayPaymentDto {
  @ApiProperty({ description: 'ID của đơn hàng cần thanh toán', example: 1 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  orderId: number;

  @ApiProperty({ 
    description: 'Thông tin mô tả đơn hàng', 
    example: 'Thanh toan don hang #1 - Banh kem socola',
    required: false 
  })
  @IsOptional()
  @IsString()
  orderInfo?: string;

  @ApiProperty({ 
    description: 'URL trả về sau khi thanh toán', 
    example: 'http://localhost:3001/payment/vnpay/callback',
    required: false 
  })
  @IsOptional()
  @IsUrl()
  returnUrl?: string;
} 