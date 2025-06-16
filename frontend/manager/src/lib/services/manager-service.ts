import { apiClient } from "@/lib/api-client";
import { 
  Manager, 
  BackendManagerResponse,
  transformManagerResponse,
  CreateManagerDto, 
  UpdateManagerDto,
  BulkDeleteManagerDto,
  PaginatedResponse 
} from "@/types/api";
import { 
  transformCreateManagerFormData, 
  transformUpdateManagerFormData,
  CreateManagerFormData,
  UpdateManagerFormData,
  BulkDeleteManagerFormData 
} from "@/lib/validations/manager";

// Backend pagination response structure
interface BackendPaginatedResponse<T> {
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

// Backend bulk delete response
interface BulkDeleteResponse {
  deleted: number[];
  failed: { id: number; reason: string }[];
  summary: { total: number; success: number; failed: number };
}

/**
 * Manager Service
 * Xử lý tất cả API calls liên quan đến managers
 */
export class ManagerService {
  private readonly endpoint = "/managers";

  /**
   * Lấy danh sách managers với pagination
   */
  async getAll(params?: { 
    page?: number; 
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Manager>> {
    const backendResponse = await apiClient.get<BackendPaginatedResponse<BackendManagerResponse>>(
      this.endpoint, 
      params
    );
    
    // Transform backend response sang frontend format
    return {
      data: backendResponse.data.map(transformManagerResponse),
      total: backendResponse.pagination.total,
      page: backendResponse.pagination.page,
      limit: backendResponse.pagination.limit,
      totalPages: backendResponse.pagination.totalPages,
    };
  }

  /**
   * Lấy manager theo ID
   */
  async getById(id: number): Promise<Manager> {
    const backendResponse = await apiClient.get<BackendManagerResponse>(`${this.endpoint}/${id}`);
    return transformManagerResponse(backendResponse);
  }

  /**
   * Lấy manager theo email
   */
  async getByEmail(email: string): Promise<Manager> {
    const backendResponse = await apiClient.get<BackendManagerResponse>(`${this.endpoint}/email/${email}`);
    return transformManagerResponse(backendResponse);
  }

  /**
   * Tạo manager mới
   */
  async create(formData: CreateManagerFormData): Promise<Manager> {
    const backendData = transformCreateManagerFormData(formData);
    const backendResponse = await apiClient.post<BackendManagerResponse>(this.endpoint, backendData);
    return transformManagerResponse(backendResponse);
  }

  /**
   * Cập nhật manager
   */
  async update(id: number, formData: UpdateManagerFormData): Promise<Manager> {
    const backendData = transformUpdateManagerFormData(formData);
    const backendResponse = await apiClient.patch<BackendManagerResponse>(`${this.endpoint}/${id}`, backendData);
    return transformManagerResponse(backendResponse);
  }

  /**
   * Xóa manager
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Xóa nhiều managers
   */
  async bulkDelete(formData: BulkDeleteManagerFormData): Promise<BulkDeleteResponse> {
    return apiClient.delete<BulkDeleteResponse>(`${this.endpoint}/bulk`, formData);
  }

  /**
   * Test API connection
   */
  async ping(): Promise<{ message: string }> {
    return apiClient.get<{ message: string }>(`${this.endpoint}/test/ping`);
  }

  /**
   * Lấy thống kê managers
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
export const managerService = new ManagerService(); 