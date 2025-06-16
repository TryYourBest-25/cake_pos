import { apiClient } from "@/lib/api-client";
import { 
  Manager, 
  CreateManagerDto, 
  UpdateManagerDto,
  PaginatedResponse 
} from "@/types/api";

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
    return apiClient.get<PaginatedResponse<Manager>>(this.endpoint, params);
  }

  /**
   * Lấy manager theo ID
   */
  async getById(id: number): Promise<Manager> {
    return apiClient.get<Manager>(`${this.endpoint}/${id}`);
  }

  /**
   * Lấy manager theo email
   */
  async getByEmail(email: string): Promise<Manager> {
    return apiClient.get<Manager>(`${this.endpoint}/email/${email}`);
  }

  /**
   * Tạo manager mới
   */
  async create(data: CreateManagerDto): Promise<Manager> {
    return apiClient.post<Manager>(this.endpoint, data);
  }

  /**
   * Cập nhật manager
   */
  async update(id: number, data: UpdateManagerDto): Promise<Manager> {
    return apiClient.patch<Manager>(`${this.endpoint}/${id}`, data);
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
  async bulkDelete(ids: number[]): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    return apiClient.post(`${this.endpoint}/bulk-delete`, { ids });
  }

  /**
   * Test API connection
   */
  async ping(): Promise<{ message: string }> {
    return apiClient.get<{ message: string }>(`${this.endpoint}/ping`);
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