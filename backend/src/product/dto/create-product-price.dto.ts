import { IsInt, Min, IsBoolean, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductSizeDto } from './create-product-size.dto';

export class CreateProductPriceDto {
  // Sẽ nhận size_id (number) nếu kết nối với ProductSize đã có,
  // hoặc một object CreateProductSizeDto nếu muốn tạo mới ProductSize
  @IsOptional() // size_id có thể không cần nếu cung cấp sizeData
  @IsInt()
  @Min(1)
  size_id?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductSizeDto)
  size_data?: CreateProductSizeDto; // Dùng để tạo mới ProductSize nếu size_id không được cung cấp

  @IsNumber({ maxDecimalPlaces: 2 }) // Giả định giá có thể có 2 chữ số thập phân, nếu là integer thì dùng IsInt
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsBoolean()
  is_active: boolean = true;
} 