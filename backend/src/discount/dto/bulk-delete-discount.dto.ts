import { IsArray, IsInt, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BulkDeleteDiscountDto {
  @ApiProperty({
    description: 'Danh sách ID của các chương trình giảm giá cần xóa',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Danh sách ID không được rỗng' })
  @IsInt({ each: true, message: 'Mỗi ID phải là số nguyên' })
  @Type(() => Number)
  ids: number[];
} 