import { IsString, IsNotEmpty, MaxLength, IsOptional, IsBoolean, IsInt, Min, ValidateNested, ArrayNotEmpty, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductPriceDto } from './create-product-price.dto';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_signature?: boolean = false;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  image_path?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  category_id?: number;
  // Hoặc có thể thêm trường để tạo category mới nếu cần, ví dụ: category_name?: string;

  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductPriceDto)
  prices: CreateProductPriceDto[]; // Một sản phẩm phải có ít nhất một giá
} 