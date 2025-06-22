import {
  IsString,
  IsNotEmpty,
  IsInt,
  MinLength,
  IsOptional,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({
    description: 'ID vai trò của tài khoản',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'role_id phải là số nguyên' })
  @IsNotEmpty({ message: 'role_id không được để trống' })
  role_id: number;

  @ApiProperty({
    description: 'Tên đăng nhập (tối thiểu 3 ký tự)',
    example: 'user123',
    minLength: 3,
    type: String,
  })
  @IsString({ message: 'username phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'username không được để trống' })
  @MinLength(3, { message: 'username phải có ít nhất 3 ký tự' })
  username: string;

  @ApiProperty({
    description: 'Mật khẩu (tối thiểu 8 ký tự)',
    example: 'password123',
    minLength: 8,
    type: String,
  })
  @IsString({ message: 'password phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'password không được để trống' })
  @MinLength(8, { message: 'password phải có ít nhất 8 ký tự' })
  password: string; // Password will be hashed in the service layer

  @ApiProperty({
    description: 'Trạng thái hoạt động của tài khoản',
    example: true,
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active phải là giá trị boolean' })
  is_active?: boolean;

  // is_locked is not typically set on creation, defaults to false in schema
}
