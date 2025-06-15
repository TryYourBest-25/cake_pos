import { ApiProperty } from '@nestjs/swagger';

export class EmployeeSalesDataDto {
  @ApiProperty({
    description: 'ID nhân viên',
    example: 1,
  })
  employee_id: number;

  @ApiProperty({
    description: 'Tên nhân viên',
    example: 'Nguyễn Văn A',
  })
  employee_name: string;

  @ApiProperty({
    description: 'Số đơn hàng',
    example: 25,
  })
  total_orders: number;

  @ApiProperty({
    description: 'Tổng doanh thu',
    example: 5000000,
  })
  total_revenue: number;

  @ApiProperty({
    description: 'Tổng số sản phẩm đã bán',
    example: 150,
  })
  total_products_sold: number;
}

export class MonthlySalesDataDto {
  @ApiProperty({
    description: 'Tháng',
    example: 12,
  })
  month: number;

  @ApiProperty({
    description: 'Năm',
    example: 2024,
  })
  year: number;

  @ApiProperty({
    description: 'Số đơn hàng trong tháng',
    example: 150,
  })
  total_orders: number;

  @ApiProperty({
    description: 'Doanh thu trong tháng',
    example: 25000000,
  })
  total_revenue: number;

  @ApiProperty({
    description: 'Số sản phẩm đã bán trong tháng',
    example: 800,
  })
  total_products_sold: number;
}

export class DailySalesDataDto {
  @ApiProperty({
    description: 'Ngày',
    example: 15,
  })
  day: number;

  @ApiProperty({
    description: 'Tháng',
    example: 12,
  })
  month: number;

  @ApiProperty({
    description: 'Năm',
    example: 2024,
  })
  year: number;

  @ApiProperty({
    description: 'Số đơn hàng trong ngày',
    example: 8,
  })
  total_orders: number;

  @ApiProperty({
    description: 'Doanh thu trong ngày',
    example: 1200000,
  })
  total_revenue: number;

  @ApiProperty({
    description: 'Số sản phẩm đã bán trong ngày',
    example: 45,
  })
  total_products_sold: number;
}

export class ProductSalesDataDto {
  @ApiProperty({
    description: 'ID sản phẩm',
    example: 1,
  })
  product_id: number;

  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'Bánh kem chocolate',
  })
  product_name: string;

  @ApiProperty({
    description: 'Số lượng đã bán',
    example: 50,
  })
  quantity_sold: number;

  @ApiProperty({
    description: 'Doanh thu từ sản phẩm',
    example: 2500000,
  })
  revenue: number;
}

export class SalesReportResponseDto {
  @ApiProperty({
    description: 'Tóm tắt báo cáo',
    type: Object,
  })
  summary: {
    total_orders: number;
    total_revenue: number;
    total_products_sold: number;
    period: string;
  };

  @ApiProperty({
    description: 'Dữ liệu bán hàng theo nhân viên',
    type: [EmployeeSalesDataDto],
  })
  employee_sales?: EmployeeSalesDataDto[];

  @ApiProperty({
    description: 'Dữ liệu bán hàng theo tháng',
    type: [MonthlySalesDataDto],
  })
  monthly_sales?: MonthlySalesDataDto[];

  @ApiProperty({
    description: 'Dữ liệu bán hàng theo ngày',
    type: [DailySalesDataDto],
  })
  daily_sales?: DailySalesDataDto[];

  @ApiProperty({
    description: 'Dữ liệu bán hàng theo sản phẩm',
    type: [ProductSalesDataDto],
  })
  product_sales?: ProductSalesDataDto[];
} 