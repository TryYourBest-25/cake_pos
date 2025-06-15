import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
import {
  SalesReportResponseDto,
  EmployeeSalesDataDto,
  MonthlySalesDataDto,
  DailySalesDataDto,
  ProductSalesDataDto,
} from './dto/sales-report-response.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSalesReport(query: SalesReportQueryDto): Promise<SalesReportResponseDto> {
    const { month, year, employee_id } = query;
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month;

    // Tạo filter cho thời gian
    const dateFilter = this.buildDateFilter(targetYear, targetMonth);
    
    // Tạo filter cho nhân viên
    const employeeFilter = employee_id ? { employee_id } : {};

    // Truy vấn tóm tắt
    const summary = await this.getSummaryData(dateFilter, employeeFilter);

    // Truy vấn dữ liệu chi tiết
    const [employeeSales, monthlySales, dailySales, productSales] = await Promise.all([
      this.getEmployeeSalesData(dateFilter, employeeFilter),
      !targetMonth ? this.getMonthlySalesData(targetYear, employeeFilter) : undefined,
      targetMonth ? this.getDailySalesData(targetYear, targetMonth, employeeFilter) : undefined,
      this.getProductSalesData(dateFilter, employeeFilter),
    ]);

    const period = this.getPeriodString(targetYear, targetMonth);

    return {
      summary: { ...summary, period },
      employee_sales: employeeSales,
      monthly_sales: monthlySales,
      daily_sales: dailySales,
      product_sales: productSales,
    };
  }

  private buildDateFilter(year: number, month?: number) {
    if (month) {
      // Lọc theo tháng cụ thể
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      return {
        order_time: {
          gte: startDate,
          lte: endDate,
        },
      };
    } else {
      // Lọc theo năm
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      return {
        order_time: {
          gte: startDate,
          lte: endDate,
        },
      };
    }
  }

  private async getSummaryData(dateFilter: any, employeeFilter: any) {
    const orders = await this.prisma.order.findMany({
      where: {
        ...dateFilter,
        ...employeeFilter,
        status: 'COMPLETED',
      },
      include: {
        order_product: true,
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.final_amount || 0), 0);
    const totalProductsSold = orders.reduce((sum, order) => 
      sum + order.order_product.reduce((productSum, product) => productSum + product.quantity, 0), 0
    );

    return {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      total_products_sold: totalProductsSold,
    };
  }

  private async getEmployeeSalesData(dateFilter: any, employeeFilter: any): Promise<EmployeeSalesDataDto[]> {
    const employeeSales = await this.prisma.order.groupBy({
      by: ['employee_id'],
      where: {
        ...dateFilter,
        ...employeeFilter,
        status: 'COMPLETED',
      },
      _count: {
        order_id: true,
      },
      _sum: {
        final_amount: true,
      },
    });

    // Lấy thông tin nhân viên và số sản phẩm đã bán
    const employeeDetails = await Promise.all(
      employeeSales.map(async (sale) => {
        const employee = await this.prisma.employee.findUnique({
          where: { employee_id: sale.employee_id },
        });

        const orders = await this.prisma.order.findMany({
          where: {
            employee_id: sale.employee_id,
            ...dateFilter,
            status: 'COMPLETED',
          },
          include: {
            order_product: true,
          },
        });

        const totalProductsSold = orders.reduce((sum, order) => 
          sum + order.order_product.reduce((productSum, product) => productSum + product.quantity, 0), 0
        );

        return {
          employee_id: sale.employee_id,
          employee_name: `${employee?.first_name} ${employee?.last_name}`,
          total_orders: sale._count.order_id,
          total_revenue: sale._sum.final_amount || 0,
          total_products_sold: totalProductsSold,
        };
      })
    );

    return employeeDetails.sort((a, b) => b.total_revenue - a.total_revenue);
  }

  private async getMonthlySalesData(year: number, employeeFilter: any): Promise<MonthlySalesDataDto[]> {
    const monthlySales: MonthlySalesDataDto[] = [];

    for (let month = 1; month <= 12; month++) {
      const dateFilter = this.buildDateFilter(year, month);
      
      const orders = await this.prisma.order.findMany({
        where: {
          ...dateFilter,
          ...employeeFilter,
          status: 'COMPLETED',
        },
        include: {
          order_product: true,
        },
      });

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.final_amount || 0), 0);
      const totalProductsSold = orders.reduce((sum, order) => 
        sum + order.order_product.reduce((productSum, product) => productSum + product.quantity, 0), 0
      );

      monthlySales.push({
        month,
        year,
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        total_products_sold: totalProductsSold,
      });
    }

    return monthlySales;
  }

  private async getDailySalesData(year: number, month: number, employeeFilter: any): Promise<DailySalesDataDto[]> {
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailySales: DailySalesDataDto[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const startDate = new Date(year, month - 1, day, 0, 0, 0);
      const endDate = new Date(year, month - 1, day, 23, 59, 59);
      
      const dateFilter = {
        order_time: {
          gte: startDate,
          lte: endDate,
        },
      };

      const orders = await this.prisma.order.findMany({
        where: {
          ...dateFilter,
          ...employeeFilter,
          status: 'COMPLETED',
        },
        include: {
          order_product: true,
        },
      });

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.final_amount || 0), 0);
      const totalProductsSold = orders.reduce((sum, order) => 
        sum + order.order_product.reduce((productSum, product) => productSum + product.quantity, 0), 0
      );

      dailySales.push({
        day,
        month,
        year,
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        total_products_sold: totalProductsSold,
      });
    }

    return dailySales;
  }

  private async getProductSalesData(dateFilter: any, employeeFilter: any): Promise<ProductSalesDataDto[]> {
    const productSales = await this.prisma.order_product.groupBy({
      by: ['product_price_id'],
      where: {
        order: {
          ...dateFilter,
          ...employeeFilter,
          status: 'COMPLETED',
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const productDetails = await Promise.all(
      productSales.map(async (sale) => {
        const productPrice = await this.prisma.product_price.findUnique({
          where: { product_price_id: sale.product_price_id },
          include: {
            product: true,
          },
        });

        // Tính doanh thu từ sản phẩm
        const orders = await this.prisma.order.findMany({
          where: {
            ...dateFilter,
            ...employeeFilter,
            status: 'COMPLETED',
            order_product: {
              some: {
                product_price_id: sale.product_price_id,
              },
            },
          },
          include: {
            order_product: {
              where: {
                product_price_id: sale.product_price_id,
              },
            },
          },
        });

        const revenue = orders.reduce((sum, order) => 
          sum + order.order_product.reduce((productSum, product) => 
            productSum + (product.quantity * (productPrice?.price || 0)), 0
          ), 0
        );

        return {
          product_id: productPrice?.product.product_id || 0,
          product_name: productPrice?.product.name || 'Không xác định',
          quantity_sold: sale._sum.quantity || 0,
          revenue: revenue,
        };
      })
    );

    return productDetails
      .filter(product => product.quantity_sold > 0)
      .sort((a, b) => b.quantity_sold - a.quantity_sold);
  }

  private getPeriodString(year: number, month?: number): string {
    if (month) {
      return `Tháng ${month}/${year}`;
    }
    return `Năm ${year}`;
  }
}
