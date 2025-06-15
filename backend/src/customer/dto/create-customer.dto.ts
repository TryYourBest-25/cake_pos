import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, IsEnum, IsPhoneNumber, MinLength } from 'class-validator';
import { gender_enum } from '../../generated/prisma/client';

export class CreateCustomerDto {
  @IsInt()
  @IsNotEmpty()
  membership_type_id: number;

  @IsOptional()
  @IsString()
  @MaxLength(70)
  last_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(70)
  first_name?: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  @MaxLength(15)
  phone: string;

  @IsOptional()
  @IsInt()
  current_points?: number;

  @IsOptional()
  @IsEnum(gender_enum)
  gender?: gender_enum;

  // Thông tin tài khoản (tùy chọn cho customer)
  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
} 