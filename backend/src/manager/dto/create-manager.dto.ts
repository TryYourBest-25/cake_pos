import { IsString, IsNotEmpty, MaxLength, IsEmail, IsPhoneNumber, IsInt } from 'class-validator';

export class CreateManagerDto {
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

  @IsPhoneNumber() // Mặc định sử dụng cài đặt toàn cục, hoặc chỉ định vùng nếu cần (ví dụ 'VN')
  @IsNotEmpty()
  @MaxLength(15)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  position: string; // Ví dụ: 'Store Manager', 'Regional Manager'

  @IsInt()
  @IsNotEmpty()
  account_id: number; // ID của tài khoản liên kết
} 