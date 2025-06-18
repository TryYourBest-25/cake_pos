import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsInt,
  Min,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsNumber,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMembershipTypeDto {
  @ApiProperty({
    description: 'Tên loại thành viên (unique)',
    example: 'Vàng',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @ApiProperty({
    description: 'Giá trị giảm giá phần trăm 0-100%',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discount_value: number;

  @ApiProperty({
    description: 'Điểm yêu cầu để đạt được hạng thành viên này',
    example: 1000,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  required_point: number;

  @ApiProperty({
    description: 'Mô tả chi tiết về loại thành viên',
    example: 'Giảm giá 10% cho tất cả đơn hàng.',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    description: 'Ngày hết hạn của loại thành viên (YYYY-MM-DD)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  valid_until?: string; // Sẽ được chuyển thành Date object

  @ApiProperty({
    description: 'Trạng thái kích hoạt của loại thành viên',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  // created_at và updated_at sẽ tự động được quản lý bởi Prisma
}
