import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  Matches,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // For Swagger documentation

export class CreateStoreDto {
  @ApiProperty({
    description: 'Tên của cửa hàng',
    maxLength: 100,
    example: 'Cake POS Chi Nhánh Quận 1',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Địa chỉ của cửa hàng',
    maxLength: 255,
    example: '123 Đường ABC, Phường X, Quận 1, TP. HCM',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @ApiProperty({
    description: 'Số điện thoại của cửa hàng',
    maxLength: 15,
    example: '0901234567',
    pattern: '^\\+?[1-9]\\d{1,14}$',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  @Matches(/^\\+?[1-9]\\d{1,14}$/, { message: 'Số điện thoại không hợp lệ.' })
  phone: string;

  @ApiProperty({
    description: 'Thời gian mở cửa hàng (HH:mm hoặc HH:mm:ss)',
    example: '08:00:00',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)(:([0-5]\\d))?$',
  })
  @IsString() // Sẽ được Prisma chuyển đổi thành DateTime
  @IsNotEmpty()
  @Matches(/^([01]\\d|2[0-3]):([0-5]\\d)(:([0-5]\\d))?$/, {
    message: 'Thời gian mở cửa không hợp lệ. Định dạng HH:mm hoặc HH:mm:ss',
  })
  opening_time: string; // Dạng string 'HH:mm:ss' hoặc 'HH:mm'

  @ApiProperty({
    description: 'Thời gian đóng cửa hàng (HH:mm hoặc HH:mm:ss)',
    example: '22:00:00',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)(:([0-5]\\d))?$',
  })
  @IsString() // Sẽ được Prisma chuyển đổi thành DateTime
  @IsNotEmpty()
  @Matches(/^([01]\\d|2[0-3]):([0-5]\\d)(:([0-5]\\d))?$/, {
    message: 'Thời gian đóng cửa không hợp lệ. Định dạng HH:mm hoặc HH:mm:ss',
  })
  closing_time: string; // Dạng string 'HH:mm:ss' hoặc 'HH:mm'

  @ApiProperty({
    description: 'Địa chỉ email của cửa hàng',
    maxLength: 100,
    example: 'store.q1@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    description: 'Ngày khai trương cửa hàng (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  opening_date: string; // Dạng string 'YYYY-MM-DD'

  @ApiProperty({
    description: 'Mã số thuế của cửa hàng',
    maxLength: 20,
    example: '0312345678',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  tax_code: string;

  // created_at và updated_at sẽ tự động được quản lý bởi Prisma
}
