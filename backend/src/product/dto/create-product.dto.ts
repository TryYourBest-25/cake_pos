import { IsString, IsNotEmpty, MaxLength, IsOptional, IsBoolean, IsInt, Min, ValidateNested, ArrayNotEmpty, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductPriceDto } from './create-product-price.dto';

export class CreateProductDto {
  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'Bánh kem dâu',
    maxLength: 100,
    type: String,
  })
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @MaxLength(100, { message: 'Tên sản phẩm không được vượt quá 100 ký tự' })
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả sản phẩm',
    example: 'Bánh kem tươi với dâu tự nhiên',
    maxLength: 1000,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @MaxLength(1000, { message: 'Mô tả không được vượt quá 1000 ký tự' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Đánh dấu sản phẩm là đặc trưng hay không',
    example: false,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái đặc trưng phải là boolean' })
  is_signature?: boolean = false;

  @ApiPropertyOptional({
    description: 'Đường dẫn hình ảnh sản phẩm',
    example: '/uploads/products/cake-strawberry.jpg',
    maxLength: 255,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Đường dẫn hình ảnh phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Đường dẫn hình ảnh không được vượt quá 255 ký tự' })
  image_path?: string;

  @ApiPropertyOptional({
    description: 'ID của danh mục sản phẩm',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'ID danh mục phải là số nguyên' })
  @Min(1, { message: 'ID danh mục phải lớn hơn 0' })
  @Type(() => Number)
  category_id?: number;

  @ApiProperty({
    description: 'Danh sách giá cho các kích thước khác nhau của sản phẩm',
    type: [CreateProductPriceDto],
    isArray: true,
    minItems: 1,
  })
  @ArrayNotEmpty({ message: 'Danh sách giá không được để trống' })
  @ArrayMinSize(1, { message: 'Sản phẩm phải có ít nhất một giá' })
  @ValidateNested({ each: true, message: 'Dữ liệu giá không hợp lệ' })
  @Type(() => CreateProductPriceDto)
  prices: CreateProductPriceDto[]; // Một sản phẩm phải có ít nhất một giá
} 