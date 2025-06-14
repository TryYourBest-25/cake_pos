import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateImageDto {
  @ApiProperty({
    description: 'URL ảnh cũ cần xóa',
    example: 'https://storage.googleapis.com/your-bucket/products/old-image.jpg',
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  oldImageUrl: string;

  @ApiProperty({
    description: 'Tên file mới tùy chọn',
    required: false,
    maxLength: 100,
    example: 'new-product-image.jpg',
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