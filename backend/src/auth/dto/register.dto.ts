import { IsString, IsNotEmpty, MinLength, IsNumber } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNumber()
  @IsNotEmpty()
  role_id: number;
} 