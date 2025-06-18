import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class SalesReportQueryDto {
  @ApiPropertyOptional({
    description: 'Tháng báo cáo (1-12)',
    example: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tháng phải là số nguyên' })
  @Min(1, { message: 'Tháng phải từ 1 đến 12' })
  @Max(12, { message: 'Tháng phải từ 1 đến 12' })
  month?: number;

  @ApiPropertyOptional({
    description: 'Năm báo cáo',
    example: 2024,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Năm phải là số nguyên' })
  @Min(2020, { message: 'Năm phải từ 2020 trở đi' })
  year?: number;

  @ApiPropertyOptional({
    description: 'ID nhân viên (để báo cáo theo nhân viên cụ thể)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Employee ID phải là số nguyên' })
  employee_id?: number;
}
