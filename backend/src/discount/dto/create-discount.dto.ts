import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
  IsDateString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer'; // Để chuyển đổi sang Decimal nếu cần

// Có thể định nghĩa một enum cho loại giảm giá nếu cần
// export enum DiscountType { PERCENTAGE = 'PERCENTAGE', FIXED_AMOUNT = 'FIXED_AMOUNT' }

export class CreateDiscountDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Coupon code must be uppercase alphanumeric and unique.',
  })
  coupon_code: string; // Mã coupon sẽ được dùng để tạo/kết nối với Coupon entity

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number) // Đảm bảo chuyển đổi đúng cách nếu dữ liệu đến từ JSON string
  discount_value: number; // Prisma model dùng Decimal, NestJS/class-validator dùng number

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  min_required_order_value: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  max_discount_amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  min_required_product?: number;

  @IsOptional()
  @IsDateString()
  valid_from?: string; // ISO 8601 date string

  @IsDateString()
  @IsNotEmpty()
  valid_until: string; // ISO 8601 date string

  @IsOptional()
  @IsNumber()
  @Min(1) // Max uses phải ít nhất là 1 nếu được cung cấp
  @Type(() => Number)
  max_uses?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  max_uses_per_customer?: number;

  @IsBoolean()
  @IsOptional()
  is_active: boolean = true;
}
