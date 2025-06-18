import {
  IsString,
  IsOptional,
  IsInt,
  MinLength,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types'; // Helper for Update DTOs
import { CreateAccountDto } from './create-account.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @ApiProperty({
    description: 'Tên đăng nhập mới (tối thiểu 3 ký tự)',
    example: 'newuser123',
    required: false,
    minLength: 3,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'username phải là chuỗi ký tự' })
  @MinLength(3, { message: 'username phải có ít nhất 3 ký tự' })
  username?: string;

  @ApiProperty({
    description: 'Mật khẩu mới (tối thiểu 8 ký tự)',
    example: 'newpassword123',
    required: false,
    minLength: 8,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'password phải là chuỗi ký tự' })
  @MinLength(8, { message: 'password phải có ít nhất 8 ký tự' })
  password?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động của tài khoản',
    example: false,
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active phải là giá trị boolean' })
  is_active?: boolean;

  @ApiProperty({
    description: 'Trạng thái khóa tài khoản',
    example: true,
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_locked phải là giá trị boolean' })
  is_locked?: boolean;

  // refresh_token is usually handled by auth-specific logic, not a general update DTO
  // last_login is updated automatically
}
