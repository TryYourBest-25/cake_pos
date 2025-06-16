import { IsInt, Min, IsBoolean, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductSizeDto } from './create-product-size.dto';

export class CreateProductPriceDto {
  @ApiPropertyOptional({
    description: 'ID của kích thước sản phẩm đã tồn tại',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'ID kích thước phải là số nguyên' })
  @Min(1, { message: 'ID kích thước phải lớn hơn 0' })
  @Type(() => Number)
  size_id?: number;

  @ApiPropertyOptional({
    description: 'Dữ liệu để tạo kích thước mới (nếu không có size_id)',
    type: CreateProductSizeDto,
  })
  @IsOptional()
  @ValidateNested({ message: 'Dữ liệu kích thước không hợp lệ' })
  @Type(() => CreateProductSizeDto)
  size_data?: CreateProductSizeDto;

  @ApiProperty({
    description: 'Giá của sản phẩm',
    example: 150000,
    type: Number,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Giá phải là số với tối đa 2 chữ số thập phân' })
  @Min(0, { message: 'Giá phải lớn hơn hoặc bằng 0' })
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    description: 'Trạng thái kích hoạt của giá',
    example: true,
    type: Boolean,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái kích hoạt phải là boolean' })
  is_active: boolean = true;
} 