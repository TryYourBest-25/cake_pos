import { apiClient } from "@/lib/api-client";
import { 
  Employee, 
  BackendEmployeeResponse,
  BackendPaginatedResponse,
  BulkDeleteResponse,
  transformEmployeeResponse,
  CreateEmployeeDto, 
  UpdateEmployeeDto,
  BulkDeleteEmployeeDto,
  PaginatedResponse 
} from "@/types/api";
import { 
  transformCreateEmployeeFormData, 
  transformUpdateEmployeeFormData,
  CreateEmployeeFormData,
  UpdateEmployeeFormData,
  BulkDeleteEmployeeFormData 
} from "@/lib/validations/employee";

/**
 * Employee Service
 * Xử lý tất cả API calls liên quan đến employees
 */
export class EmployeeService {
  private readonly endpoint = "/employees";

  /**
   * Lấy danh sách employees với pagination
   */
  async getAll(params?: { 
    page?: number; 
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Employee>> {
    const backendResponse = await apiClient.get<BackendPaginatedResponse<BackendEmployeeResponse>>(
      this.endpoint, 
      params
    );
    
    // Transform backend response sang frontend format
    return {
      data: backendResponse.data.map(transformEmployeeResponse),
      total: backendResponse.pagination.total,
      page: backendResponse.pagination.page,
      limit: backendResponse.pagination.limit,
      totalPages: backendResponse.pagination.totalPages,
    };
  }

  /**
   * Lấy employee theo ID
   */
  async getById(id: number): Promise<Employee> {
    const backendResponse = await apiClient.get<BackendEmployeeResponse>(`${this.endpoint}/${id}`);
    return transformEmployeeResponse(backendResponse);
  }

  /**
   * Lấy employee theo email
   */
  async getByEmail(email: string): Promise<Employee> {
    const backendResponse = await apiClient.get<BackendEmployeeResponse>(`${this.endpoint}/email/${email}`);
    return transformEmployeeResponse(backendResponse);
  }

  /**
   * Tạo employee mới
   */
  async create(formData: CreateEmployeeFormData): Promise<Employee> {
    const backendData = transformCreateEmployeeFormData(formData);
    const backendResponse = await apiClient.post<BackendEmployeeResponse>(this.endpoint, backendData);
    return transformEmployeeResponse(backendResponse);
  }

  /**
   * Cập nhật employee
   */
  async update(id: number, formData: UpdateEmployeeFormData): Promise<Employee> {
    const backendData = transformUpdateEmployeeFormData(formData);
    const backendResponse = await apiClient.patch<BackendEmployeeResponse>(`${this.endpoint}/${id}`, backendData);
    return transformEmployeeResponse(backendResponse);
  }

  /**
   * Xóa employee
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Xóa nhiều employees
   */
  async bulkDelete(formData: BulkDeleteEmployeeFormData): Promise<BulkDeleteResponse> {
    return apiClient.delete<BulkDeleteResponse>(`${this.endpoint}/bulk`, formData);
  }

  /**
   * Test API connection
   */
  async ping(): Promise<{ message: string }> {
    return apiClient.get<{ message: string }>(`${this.endpoint}/test/ping`);
  }

  /**
   * Lấy thống kê employees
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    recentlyCreated: number;
  }> {
    return apiClient.get<{
      total: number;
      active: number;
      inactive: number;
      recentlyCreated: number;
    }>(`${this.endpoint}/stats`);
  }
}

// Export singleton instance
export const employeeService = new EmployeeService(); 