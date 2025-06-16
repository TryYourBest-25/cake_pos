import { apiClient } from "@/lib/api-client";
import { 
  Customer, 
  BackendCustomerResponse,
  BackendPaginatedResponse,
  transformCustomerResponse,
  CreateCustomerDto, 
  UpdateCustomerDto,
  BulkDeleteCustomerDto,
  PaginatedResponse 
} from "@/types/api";
import { 
  transformCreateCustomerFormData, 
  transformUpdateCustomerFormData,
  CreateCustomerFormData,
  UpdateCustomerFormData,
  BulkDeleteCustomerFormData 
} from "@/lib/validations/customer";

/**
 * Customer Service
 * Xử lý tất cả API calls liên quan đến customers
 */
export class CustomerService {
  private readonly endpoint = "/customers";

  /**
   * Lấy danh sách customers với pagination
   */
  async getAll(params?: { 
    page?: number; 
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Customer>> {
    const backendResponse = await apiClient.get<BackendPaginatedResponse<BackendCustomerResponse>>(
      this.endpoint, 
      params
    );
    
    // Transform backend response sang frontend format
    return {
      data: backendResponse.data.map(transformCustomerResponse),
      total: backendResponse.pagination.total,
      page: backendResponse.pagination.page,
      limit: backendResponse.pagination.limit,
      totalPages: backendResponse.pagination.totalPages,
    };
  }

  /**
   * Lấy customer theo ID
   */
  async getById(id: number): Promise<Customer> {
    const backendResponse = await apiClient.get<BackendCustomerResponse>(`${this.endpoint}/${id}`);
    return transformCustomerResponse(backendResponse);
  }

  /**
   * Lấy customer theo phone
   */
  async getByPhone(phone: string): Promise<Customer> {
    const backendResponse = await apiClient.get<BackendCustomerResponse>(`${this.endpoint}/phone/${phone}`);
    return transformCustomerResponse(backendResponse);
  }

  /**
   * Lấy customers theo membership type
   */
  async getByMembershipType(membershipTypeId: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Customer>> {
    const backendResponse = await apiClient.get<BackendPaginatedResponse<BackendCustomerResponse>>(
      `${this.endpoint}/membership-type/${membershipTypeId}`,
      params
    );
    
    return {
      data: backendResponse.data.map(transformCustomerResponse),
      total: backendResponse.pagination.total,
      page: backendResponse.pagination.page,
      limit: backendResponse.pagination.limit,
      totalPages: backendResponse.pagination.totalPages,
    };
  }

  /**
   * Tạo customer mới
   */
  async create(formData: CreateCustomerFormData): Promise<Customer> {
    const backendData = transformCreateCustomerFormData(formData);
    const backendResponse = await apiClient.post<BackendCustomerResponse>(this.endpoint, backendData);
    return transformCustomerResponse(backendResponse);
  }

  /**
   * Cập nhật customer
   */
  async update(id: number, formData: UpdateCustomerFormData): Promise<Customer> {
    const backendData = transformUpdateCustomerFormData(formData);
    const backendResponse = await apiClient.patch<BackendCustomerResponse>(`${this.endpoint}/${id}`, backendData);
    return transformCustomerResponse(backendResponse);
  }

  /**
   * Xóa customer
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Bulk delete customers
   */
  async bulkDelete(formData: BulkDeleteCustomerFormData): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    return await apiClient.delete(`${this.endpoint}/bulk`, { ids: formData.ids });
  }

  /**
   * Test customer controller
   */
  async test(): Promise<{ message: string }> {
    return await apiClient.get(`${this.endpoint}/test/ping`);
  }
}

// Export singleton instance
export const customerService = new CustomerService(); 