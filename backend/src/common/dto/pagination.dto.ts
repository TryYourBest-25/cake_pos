import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    description: 'Số trang (bắt đầu từ 1)',
    example: 1,
    minimum: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Page phải là số nguyên' })
  @Min(1, { message: 'Page phải lớn hơn hoặc bằng 1' })
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng bản ghi trên mỗi trang',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsInt({ message: 'Limit phải là số nguyên' })
  @Min(1, { message: 'Limit phải lớn hơn hoặc bằng 1' })
  @Max(100, { message: 'Limit không được vượt quá 100' })
  @Type(() => Number)
  limit?: number = 10;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
