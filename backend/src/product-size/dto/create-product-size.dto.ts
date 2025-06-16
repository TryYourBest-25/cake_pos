import { IsString, IsInt, IsOptional, Length, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductSizeDto {
  @ApiProperty({ 
    description: 'Tên kích thước sản phẩm', 
    example: 'S', 
    maxLength: 5 
  })
  @IsString({ message: 'Tên phải là chuỗi' })
  @Length(1, 5, { message: 'Tên phải có độ dài từ 1 đến 5 ký tự' })
  name: string;

  @ApiProperty({ 
    description: 'Đơn vị đo lường', 
    example: 'inch', 
    maxLength: 15 
  })
  @IsString({ message: 'Đơn vị phải là chuỗi' })
  @Length(1, 15, { message: 'Đơn vị phải có độ dài từ 1 đến 15 ký tự' })
  unit: string;

  @ApiProperty({ 
    description: 'Số lượng/kích thước', 
    example: 6,
    minimum: 1 
  })
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  quantity: number;

  @ApiProperty({ 
    description: 'Mô tả kích thước sản phẩm', 
    example: 'Kích thước nhỏ, phù hợp cho 1-2 người',
    required: false,
    maxLength: 1000 
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  @Length(0, 1000, { message: 'Mô tả không được vượt quá 1000 ký tự' })
  description?: string;
} 