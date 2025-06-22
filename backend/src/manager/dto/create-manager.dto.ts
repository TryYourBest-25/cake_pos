import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { gender_enum } from '../../generated/prisma/client';

export class CreateManagerDto {
  @ApiProperty({
    description: 'Tên của quản lý',
    example: 'Nguyễn Văn',
    maxLength: 70,
  })
  @IsString({ message: 'Tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @MaxLength(70, { message: 'Tên không được vượt quá 70 ký tự' })
  first_name: string;

  @ApiProperty({
    description: 'Họ của quản lý',
    example: 'A',
    maxLength: 70,
  })
  @IsString({ message: 'Họ phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ không được để trống' })
  @MaxLength(70, { message: 'Họ không được vượt quá 70 ký tự' })
  last_name: string;

  @ApiProperty({
    description: 'Email của quản lý',
    example: 'manager@banhngotnhalam.com',
    maxLength: 100,
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @MaxLength(100, { message: 'Email không được vượt quá 100 ký tự' })
  email: string;

  @ApiProperty({
    description: 'Số điện thoại của quản lý',
    example: '0901234567',
    maxLength: 15,
  })
  @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @MaxLength(15, { message: 'Số điện thoại không được vượt quá 15 ký tự' })
  phone: string;

  @ApiProperty({
    description: 'Giới tính của quản lý',
    example: 'MALE',
    enum: gender_enum,
    required: false,
  })
  @IsOptional()
  @IsEnum(gender_enum, { message: 'Giới tính phải là MALE, FEMALE hoặc OTHER' })
  gender?: gender_enum;

  // Thông tin tài khoản (bắt buộc cho manager)
  @ApiProperty({
    description: 'Tên đăng nhập cho tài khoản quản lý',
    example: 'manager01',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
  @MaxLength(50, { message: 'Tên đăng nhập không được vượt quá 50 ký tự' })
  username: string;
}
