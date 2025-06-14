import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteImageDto {
  @ApiProperty({
    description: 'URL đầy đủ của ảnh cần xóa',
    example: 'https://storage.googleapis.com/your-bucket/products/image.jpg',
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  imageUrl: string;
} 