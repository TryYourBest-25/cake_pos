import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, IsEnum, IsPhoneNumber } from 'class-validator';
import { gender_enum } from '../../generated/prisma/client'; // Adjusted import path for enum

export class CreateCustomerDto {
  @IsInt()
  @IsNotEmpty()
  membership_type_id: number;

  @IsOptional()
  @IsInt()
  account_id?: number;

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
  @IsPhoneNumber() // Removed null, let it use default behavior or specify region like 'VN'
  @MaxLength(15)
  phone: string;

  @IsOptional()
  @IsInt()
  current_points?: number;

  @IsOptional()
  @IsEnum(gender_enum)
  gender?: gender_enum;
} 