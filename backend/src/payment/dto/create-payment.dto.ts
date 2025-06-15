import { IsInt, IsNotEmpty, Min, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// Đồng bộ với payment_status_enum trong schema.prisma
export enum PaymentStatusEnum {
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  // FAILED = 'FAILED', // Loại bỏ nếu không có trong Prisma enum
  // REFUNDED = 'REFUNDED', // Loại bỏ nếu không có trong Prisma enum
}

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
  amount_paid: number; // Sẽ được chuyển thành Decimal trong service

  // status sẽ được service quản lý, không cho phép client gửi

  @ApiProperty({ description: 'Thời gian thanh toán (ISO 8601 string), mặc định là thời điểm hiện tại nếu không cung cấp', example: '2024-07-26T10:30:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  payment_time?: string; // Sẽ được chuyển thành Date object

  // change_amount sẽ được tính toán và lưu bởi service, không phải là input trực tiếp từ client khi tạo mới.
  // created_at và updated_at sẽ được Prisma quản lý.
} 