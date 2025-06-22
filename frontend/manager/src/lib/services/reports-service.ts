import { apiClient } from '../api-client';
import { 
  SalesReportQuery, 
  SalesReportResponse, 
  transformSalesReportResponse 
} from '@/types/api';

export class ReportsService {
  private readonly baseUrl = '/reports';

  async getSalesReport(query?: SalesReportQuery): Promise<SalesReportResponse> {
    try {
      console.log('Query params:', query);
      
      const response = await apiClient.get(`${this.baseUrl}/sales`, query) as any;
      console.log('API Response:', response);
      
      if (!response) {
        console.warn('Empty response from API');
        return transformSalesReportResponse(null);
      }
      
      return transformSalesReportResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy báo cáo bán hàng:', error);
      throw new Error('Không thể lấy báo cáo bán hàng');
    }
  }

  async getMonthlySalesReport(query?: SalesReportQuery): Promise<SalesReportResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/sales/monthly`, query) as any;
      
      if (!response) {
        return transformSalesReportResponse(null);
      }
      
      return transformSalesReportResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy báo cáo theo tháng:', error);
      throw new Error('Không thể lấy báo cáo theo tháng');
    }
  }

  async getDailySalesReport(query?: SalesReportQuery): Promise<SalesReportResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/sales/daily`, query) as any;
      
      if (!response) {
        return transformSalesReportResponse(null);
      }
      
      return transformSalesReportResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy báo cáo theo ngày:', error);
      throw new Error('Không thể lấy báo cáo theo ngày');
    }
  }

  async getEmployeeSalesReport(query?: SalesReportQuery): Promise<SalesReportResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/sales/employee`, query) as any;
      
      if (!response) {
        return transformSalesReportResponse(null);
      }
      
      return transformSalesReportResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy báo cáo theo nhân viên:', error);
      throw new Error('Không thể lấy báo cáo theo nhân viên');
    }
  }

  async getProductSalesReport(query?: SalesReportQuery): Promise<SalesReportResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/sales/products`, query) as any;
      
      if (!response) {
        return transformSalesReportResponse(null);
      }
      
      return transformSalesReportResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy báo cáo sản phẩm:', error);
      throw new Error('Không thể lấy báo cáo sản phẩm');
    }
  }
}

export const reportsService = new ReportsService(); 