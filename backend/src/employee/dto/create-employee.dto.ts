import { IsString, IsNotEmpty, MaxLength, IsEmail, IsPhoneNumber, MinLength } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(70)
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(70)
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  @MaxLength(15)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  position: string;

  // Thông tin tài khoản (bắt buộc cho employee)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
} 