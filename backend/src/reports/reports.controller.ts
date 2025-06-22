import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
import { SalesReportResponseDto } from './dto/sales-report-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Lấy báo cáo bán hàng',
    description:
      'Lấy báo cáo bán hàng theo tháng, năm và nhân viên. Dữ liệu phù hợp cho biểu đồ cột, đường, tròn.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy báo cáo bán hàng thành công',
    type: SalesReportResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập',
  })
  async getSalesReport(
    @Query() query: SalesReportQueryDto,
  ): Promise<SalesReportResponseDto> {
    return this.reportsService.getSalesReport(query);
  }

  @Get('sales/monthly')
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Lấy báo cáo bán hàng theo tháng',
    description:
      'Lấy báo cáo bán hàng theo từng tháng trong năm. Phù hợp cho biểu đồ cột và đường.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy báo cáo bán hàng theo tháng thành công',
    type: SalesReportResponseDto,
  })
  async getMonthlySalesReport(
    @Query() query: SalesReportQueryDto,
  ): Promise<SalesReportResponseDto> {
    // Đảm bảo không có tháng cụ thể để lấy dữ liệu cả năm
    const { month, ...restQuery } = query;
    return this.reportsService.getSalesReport(restQuery);
  }

  @Get('sales/daily')
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Lấy báo cáo bán hàng theo ngày',
    description:
      'Lấy báo cáo bán hàng theo từng ngày trong tháng. Phù hợp cho biểu đồ đường.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy báo cáo bán hàng theo ngày thành công',
    type: SalesReportResponseDto,
  })
  async getDailySalesReport(
    @Query() query: SalesReportQueryDto,
  ): Promise<SalesReportResponseDto> {
    // Đảm bảo có tháng để lấy dữ liệu theo ngày
    if (!query.month) {
      query.month = new Date().getMonth() + 1;
    }
    return this.reportsService.getSalesReport(query);
  }

  @Get('sales/employee')
  @Roles(ROLES.MANAGER)
  @ApiOperation({
    summary: 'Lấy báo cáo bán hàng theo nhân viên',
    description:
      'Lấy báo cáo hiệu suất bán hàng của từng nhân viên. Phù hợp cho biểu đồ cột và tròn.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy báo cáo bán hàng theo nhân viên thành công',
    type: SalesReportResponseDto,
  })
  async getEmployeeSalesReport(
    @Query() query: SalesReportQueryDto,
  ): Promise<SalesReportResponseDto> {
    return this.reportsService.getSalesReport(query);
  }

  @Get('sales/products')
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Lấy báo cáo bán hàng theo sản phẩm',
    description:
      'Lấy báo cáo sản phẩm bán chạy nhất. Phù hợp cho biểu đồ cột và tròn.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy báo cáo bán hàng theo sản phẩm thành công',
    type: SalesReportResponseDto,
  })
  async getProductSalesReport(
    @Query() query: SalesReportQueryDto,
  ): Promise<SalesReportResponseDto> {
    return this.reportsService.getSalesReport(query);
  }
}
