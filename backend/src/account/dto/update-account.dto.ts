import { IsString, IsOptional, IsInt, MinLength, IsBoolean, IsEmail } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types'; // Helper for Update DTOs
import { CreateAccountDto } from './create-account.dto';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @IsOptional()
  @IsInt()
  role_id?: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string; // New password, if provided

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_locked?: boolean;

  // refresh_token is usually handled by auth-specific logic, not a general update DTO
  // last_login is updated automatically
} 