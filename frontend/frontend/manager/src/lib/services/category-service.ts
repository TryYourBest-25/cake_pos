import { apiClient } from "@/lib/api-client";
import { 
  Category, 
  BackendCategoryResponse,
  BackendPaginatedResponse,
  BulkDeleteResponse,
  transformCategoryResponse,
  PaginatedResponse 
} from "@/types/api";
import { 
  transformCreateCategoryFormData, 
  transformUpdateCategoryFormData,
  CreateCategoryFormData,
  UpdateCategoryFormData,
  BulkDeleteCategoryFormData 
} from "@/lib/validations/category";

/**
 * Category Service
 * Xử lý tất cả API calls liên quan đến categories
 */
export class CategoryService {
  private readonly endpoint = "/categories";

  /**
   * Lấy danh sách categories với pagination
   */
  async getAll(params?: { 
    page?: number; 
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Category>> {
    const backendResponse = await apiClient.get<BackendPaginatedResponse<BackendCategoryResponse>>(
      this.endpoint, 
      params
    );
    
    // Transform backend response sang frontend format
    return {
      data: backendResponse.data.map(transformCategoryResponse),
      total: backendResponse.pagination.total,
      page: backendResponse.pagination.page,
      limit: backendResponse.pagination.limit,
      totalPages: backendResponse.pagination.totalPages,
    };
  }

  /**
   * Lấy category theo ID
   */
  async getById(id: number): Promise<Category> {
    const backendResponse = await apiClient.get<BackendCategoryResponse>(`${this.endpoint}/${id}`);
    return transformCategoryResponse(backendResponse);
  }

  /**
   * Tạo category mới
   */
  async create(formData: CreateCategoryFormData): Promise<Category> {
    const backendData = transformCreateCategoryFormData(formData);
    const backendResponse = await apiClient.post<BackendCategoryResponse>(this.endpoint, backendData);
    return transformCategoryResponse(backendResponse);
  }

  /**
   * Cập nhật category
   */
  async update(id: number, formData: UpdateCategoryFormData): Promise<Category> {
    const backendData = transformUpdateCategoryFormData(formData);
    const backendResponse = await apiClient.patch<BackendCategoryResponse>(`${this.endpoint}/${id}`, backendData);
    return transformCategoryResponse(backendResponse);
  }

  /**
   * Xóa category
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Xóa nhiều categories
   */
  async bulkDelete(formData: BulkDeleteCategoryFormData): Promise<BulkDeleteResponse> {
    return apiClient.delete<BulkDeleteResponse>(`${this.endpoint}/bulk`, formData);
  }

  /**
   * Test API connection
   */
  async ping(): Promise<{ message: string }> {
    return apiClient.get<{ message: string }>(`${this.endpoint}/admin/test`);
  }

  /**
   * Lấy thống kê categories
   */
  async getStats(): Promise<{
    total: number;
    withProducts: number;
    withoutProducts: number;
    recentlyCreated: number;
  }> {
    return apiClient.get<{
      total: number;
      withProducts: number;
      withoutProducts: number;
      recentlyCreated: number;
    }>(`${this.endpoint}/stats`);
  }
}

// Export singleton instance
export const categoryService = new CategoryService(); 