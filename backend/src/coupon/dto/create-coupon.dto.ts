import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  coupon: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
} 