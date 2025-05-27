import { IsString, IsNotEmpty, IsInt, MinLength, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class CreateAccountDto {
  @IsInt()
  @IsNotEmpty()
  role_id: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8) // Password length should ideally be configurable or more complex
  password: string; // Password will be hashed in the service layer

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  // is_locked is not typically set on creation, defaults to false in schema
} 