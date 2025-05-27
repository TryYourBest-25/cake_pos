import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentMethodDto {
  @ApiProperty({ description: 'Tên phương thức thanh toán (unique)', example: 'Tiền mặt', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: 'Mô tả chi tiết về phương thức thanh toán', example: 'Thanh toán trực tiếp bằng tiền mặt tại quầy.', maxLength: 255, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
} 