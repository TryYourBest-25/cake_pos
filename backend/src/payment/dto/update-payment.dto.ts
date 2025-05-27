import { PartialType } from '@nestjs/swagger'; // Hoặc '@nestjs/mapped-types'
import { CreatePaymentDto, PaymentStatusEnum } from './create-payment.dto';
import { IsOptional, IsEnum, IsNumber, Min, IsDateString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  // Ghi đè hoặc thêm các trường cụ thể cho update nếu cần
  // Ví dụ: không cho phép thay đổi order_id hoặc payment_method_id sau khi tạo

  @ApiProperty({ description: 'Số tiền khách hàng trả (nếu có cập nhật)', example: 160000, required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  amount_paid?: number;

  @ApiProperty({ description: 'Trạng thái thanh toán cập nhật', enum: PaymentStatusEnum, example: PaymentStatusEnum.COMPLETED, required: false })
  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  status?: PaymentStatusEnum;

  @ApiProperty({ description: 'Thời gian thanh toán cập nhật (ISO 8601 string)', example: '2024-07-26T10:35:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  payment_time?: string;

  // Không cho phép cập nhật order_id và payment_method_id thông qua DTO này
  // Nếu muốn cho phép, bỏ comment các dòng dưới và xóa chúng khỏi CreatePaymentDto trong PartialType
  // @ApiProperty({ description: 'ID của đơn hàng liên quan', example: 1, required: false })
  // @IsOptional()
  // @IsInt()
  // @Min(1)
  // @Type(() => Number)
  // order_id?: number;

  // @ApiProperty({ description: 'ID của phương thức thanh toán', example: 1, required: false })
  // @IsOptional()
  // @IsInt()
  // @Min(1)
  // @Type(() => Number)
  // payment_method_id?: number;
} 