import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkDeleteProductPriceDto {
  @ApiProperty({
    description: 'Danh sách ID các giá sản phẩm cần xóa',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray({ message: 'ids phải là mảng' })
  @ArrayNotEmpty({ message: 'Danh sách ID không được để trống' })
  @IsInt({ each: true, message: 'Mỗi ID phải là số nguyên' })
  ids: number[];
}
