import { IsInt, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductPriceDto {
  @ApiPropertyOptional({
    description: 'Giá sản phẩm mới (VND)',
    example: 60000,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'price phải là số nguyên' })
  price?: number;

  @ApiPropertyOptional({
    description: 'Trạng thái hoạt động của giá',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active phải là giá trị boolean' })
  is_active?: boolean;
}
