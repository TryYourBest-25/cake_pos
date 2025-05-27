import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, IsEmail, IsPhoneNumber } from 'class-validator';

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

  @IsInt()
  @IsNotEmpty() // Đảm bảo account_id là bắt buộc
  account_id: number; // Bỏ dấu ?

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  position: string;

  // Thêm các trường khác ở đây dựa trên schema.prisma của bạn
  // Ví dụ:
  // @IsString()
  // @IsOptional()
  // @MaxLength(100)
  // position?: string;
} 