import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  MinLength,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { gender_enum } from '../../generated/prisma/client';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Số điện thoại khách hàng (bắt buộc)',
    example: '0123456789',
    type: String,
  })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  phone: string;

  @ApiProperty({
    description: 'Họ của khách hàng',
    example: 'Nguyễn',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Họ phải là chuỗi ký tự' })
  @MaxLength(70, { message: 'Họ không được vượt quá 70 ký tự' })
  last_name?: string;

  @ApiProperty({
    description: 'Tên của khách hàng',
    example: 'Văn A',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Tên phải là chuỗi ký tự' })
  @MaxLength(70, { message: 'Tên không được vượt quá 70 ký tự' })
  first_name?: string;

  @ApiProperty({
    description: 'Giới tính của khách hàng',
    example: 'MALE',
    required: false,
    enum: ['MALE', 'FEMALE', 'OTHER'],
    type: String,
  })
  @IsOptional()
  @IsIn(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Giới tính phải là MALE, FEMALE hoặc OTHER',
  })
  gender?: 'MALE' | 'FEMALE' | 'OTHER';

  @ApiProperty({
    description:
      'Tên đăng nhập cho tài khoản (tối thiểu 3 ký tự, không bắt buộc)',
    example: 'customer123',
    required: false,
    minLength: 3,
    type: String,
  })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
  @IsOptional()
  username?: string;
}
