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

// Class cho Swagger documentation của pagination metadata
export class PaginationMetadata {
  @ApiProperty({
    description: 'Số trang hiện tại',
    example: 1,
    minimum: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Số lượng bản ghi trên mỗi trang',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  limit: number;

  @ApiProperty({
    description: 'Tổng số bản ghi',
    example: 50,
    minimum: 0,
  })
  total: number;

  @ApiProperty({
    description: 'Tổng số trang',
    example: 5,
    minimum: 0,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Có trang tiếp theo hay không',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Có trang trước hay không',
    example: false,
  })
  hasPrev: boolean;
}

// Interface chính cho việc sử dụng trong code
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

// Helper function để tạo Swagger schema cho PaginatedResult
export function createPaginatedResponseSchema(dataType: any) {
  return {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: { $ref: `#/components/schemas/${dataType.name}` },
      },
      pagination: {
        $ref: '#/components/schemas/PaginationMetadata',
      },
    },
  };
}
