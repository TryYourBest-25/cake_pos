import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, IsEnum, IsPhoneNumber, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { gender_enum } from '../../generated/prisma/client';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'ID của loại thành viên',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'ID loại thành viên phải là số nguyên' })
  @IsNotEmpty({ message: 'ID loại thành viên không được để trống' })
  @Type(() => Number)
  membership_type_id: number;

  @ApiPropertyOptional({
    description: 'Họ và tên đệm của khách hàng',
    example: 'Trần Văn',
    maxLength: 70,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Họ phải là chuỗi ký tự' })
  @MaxLength(70, { message: 'Họ không được vượt quá 70 ký tự' })
  last_name?: string;

  @ApiPropertyOptional({
    description: 'Tên của khách hàng',
    example: 'Minh',
    maxLength: 70,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Tên phải là chuỗi ký tự' })
  @MaxLength(70, { message: 'Tên không được vượt quá 70 ký tự' })
  first_name?: string;

  @ApiProperty({
    description: 'Số điện thoại của khách hàng',
    example: '+84901234567',
    maxLength: 15,
    type: String,
  })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsPhoneNumber('VN', { message: 'Số điện thoại không đúng định dạng' })
  @MaxLength(15, { message: 'Số điện thoại không được vượt quá 15 ký tự' })
  phone: string;

  @ApiPropertyOptional({
    description: 'Điểm tích lũy hiện tại của khách hàng',
    example: 100,
    type: Number,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Điểm hiện tại phải là số nguyên' })
  @Type(() => Number)
  current_points?: number;

  @ApiPropertyOptional({
    description: 'Giới tính của khách hàng',
    example: 'male',
    enum: gender_enum,
    enumName: 'gender_enum',
  })
  @IsOptional()
  @IsEnum(gender_enum, { message: 'Giới tính phải là male hoặc female' })
  gender?: gender_enum;

  @ApiPropertyOptional({
    description: 'Tên đăng nhập cho tài khoản khách hàng (tùy chọn)',
    example: 'customer_user',
    minLength: 3,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
  username?: string;

} 