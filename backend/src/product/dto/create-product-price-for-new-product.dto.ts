import {
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductSizeForProductDto } from './create-product-size.dto';

export class CreateProductPriceForNewProductDto {
  @ApiPropertyOptional({
    description: 'ID kích thước sản phẩm (nếu sử dụng kích thước có sẵn)',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'size_id phải là số nguyên' })
  size_id?: number;

  @ApiPropertyOptional({
    description: 'Thông tin kích thước mới (nếu tạo kích thước mới)',
    type: CreateProductSizeForProductDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductSizeForProductDto)
  size_data?: CreateProductSizeForProductDto;

  @ApiProperty({
    description: 'Giá sản phẩm (VND)',
    example: 50000,
    type: Number,
  })
  @IsNotEmpty({ message: 'price không được để trống' })
  @IsInt({ message: 'price phải là số nguyên' })
  price: number;

  @ApiPropertyOptional({
    description: 'Trạng thái hoạt động của giá',
    example: true,
    default: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active phải là giá trị boolean' })
  is_active?: boolean;
}
