import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({
    description: 'Tên file tùy chọn (sẽ tự generate nếu không có)',
    required: false,
    maxLength: 100,
    example: 'product-image-1.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fileName?: string;

  @ApiProperty({
    description: 'Thư mục lưu trữ (mặc định: products)',
    required: false,
    maxLength: 50,
    example: 'products',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  folder?: string;
}
