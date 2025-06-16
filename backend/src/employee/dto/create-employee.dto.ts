import { IsString, IsNotEmpty, MaxLength, IsEmail, IsPhoneNumber, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Tên của nhân viên',
    example: 'Nguyễn',
    maxLength: 70,
    type: String,
  })
  @IsString({ message: 'Tên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @MaxLength(70, { message: 'Tên không được vượt quá 70 ký tự' })
  first_name: string;

  @ApiProperty({
    description: 'Họ và tên đệm của nhân viên',
    example: 'Văn An',
    maxLength: 70,
    type: String,
  })
  @IsString({ message: 'Họ phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Họ không được để trống' })
  @MaxLength(70, { message: 'Họ không được vượt quá 70 ký tự' })
  last_name: string;

  @ApiProperty({
    description: 'Địa chỉ email của nhân viên',
    example: 'employee@cakepos.com',
    maxLength: 255,
    format: 'email',
    type: String,
  })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự' })
  email: string;

  @ApiProperty({
    description: 'Số điện thoại của nhân viên',
    example: '+84901234567',
    maxLength: 15,
    type: String,
  })
  @IsPhoneNumber('VN', { message: 'Số điện thoại không đúng định dạng' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @MaxLength(15, { message: 'Số điện thoại không được vượt quá 15 ký tự' })
  phone: string;

  @ApiProperty({
    description: 'Vị trí/chức vụ của nhân viên',
    example: 'Nhân viên bán hàng',
    maxLength: 100,
    type: String,
  })
  @IsString({ message: 'Vị trí phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vị trí không được để trống' })
  @MaxLength(100, { message: 'Vị trí không được vượt quá 100 ký tự' })
  position: string;

  // Thông tin tài khoản (bắt buộc cho employee)
  @ApiProperty({
    description: 'Tên đăng nhập cho tài khoản nhân viên',
    example: 'employee_user',
    minLength: 3,
    type: String,
  })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
  username: string;
} 