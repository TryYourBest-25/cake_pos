import {
  IsString,
  IsOptional,
  MinLength,
  IsEmail,
  IsEnum,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { gender_enum } from '../../generated/prisma/client';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Tên đăng nhập mới (tối thiểu 3 ký tự)',
    example: 'newuser123',
    required: false,
    minLength: 3,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
  username?: string;

  @ApiProperty({
    description: 'Mật khẩu mới (tối thiểu 8 ký tự)',
    example: 'newpassword123',
    required: false,
    minLength: 8,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  password?: string;

  @ApiProperty({
    description: 'Họ',
    example: 'Nguyễn',
    required: false,
    maxLength: 70,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Họ phải là chuỗi ký tự' })
  @MaxLength(70, { message: 'Họ không được vượt quá 70 ký tự' })
  last_name?: string;

  @ApiProperty({
    description: 'Tên',
    example: 'Văn A',
    required: false,
    maxLength: 70,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Tên phải là chuỗi ký tự' })
  @MaxLength(70, { message: 'Tên không được vượt quá 70 ký tự' })
  first_name?: string;

  @ApiProperty({
    description: 'Giới tính',
    example: 'MALE',
    required: false,
    enum: gender_enum,
  })
  @IsOptional()
  @IsEnum(gender_enum, { message: 'Giới tính không hợp lệ' })
  gender?: gender_enum;

  @ApiProperty({
    description: 'Số điện thoại (10-11 số)',
    example: '0901234567',
    required: false,
    maxLength: 15,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @MaxLength(15, { message: 'Số điện thoại không được vượt quá 15 ký tự' })
  @Matches(/^[0-9+\-\s()]{10,15}$/, { 
    message: 'Số điện thoại không hợp lệ' 
  })
  phone?: string;

  @ApiProperty({
    description: 'Email',
    example: 'user@example.com',
    required: false,
    maxLength: 100,
    type: String,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(100, { message: 'Email không được vượt quá 100 ký tự' })
  email?: string;

  @ApiProperty({
    description: 'Chức vụ (chỉ dành cho nhân viên)',
    example: 'Nhân viên bán hàng',
    required: false,
    maxLength: 50,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Chức vụ phải là chuỗi ký tự' })
  @MaxLength(50, { message: 'Chức vụ không được vượt quá 50 ký tự' })
  position?: string;
} 