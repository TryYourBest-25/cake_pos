import { apiClient } from "@/lib/api-client";
import { 
  BackendDiscountResponse, 
  Discount, 
  CreateDiscountDto, 
  UpdateDiscountDto,
  BackendPaginatedResponse,
  PaginatedResponse,
  BulkDeleteResponse,
  transformDiscountResponse
} from "@/types/api";

/**
 * Discount Service
 * Xử lý tất cả API calls liên quan đến discounts
 */
export class DiscountService {
  private readonly endpoint = "/discounts";

  /**
   * Lấy danh sách discounts với pagination
   */
  async getAll(params?: { 
    page?: number; 
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Discount>> {
    const backendResponse = await apiClient.get<BackendPaginatedResponse<BackendDiscountResponse>>(
      this.endpoint, 
      params
    );
    
    // Transform backend response sang frontend format
    return {
      data: backendResponse.data.map(transformDiscountResponse),
      total: backendResponse.pagination.total,
      page: backendResponse.pagination.page,
      limit: backendResponse.pagination.limit,
      totalPages: backendResponse.pagination.totalPages,
    };
  }

  /**
   * Lấy discount theo ID
   */
  async getById(id: number): Promise<Discount> {
    const backendResponse = await apiClient.get<BackendDiscountResponse>(`${this.endpoint}/${id}`);
    return transformDiscountResponse(backendResponse);
  }

  /**
   * Lấy discount theo coupon code
   */
  async getByCouponCode(couponCode: string): Promise<Discount> {
    const backendResponse = await apiClient.get<BackendDiscountResponse>(`${this.endpoint}/coupon/${couponCode}`);
    return transformDiscountResponse(backendResponse);
  }

  /**
   * Tạo discount mới
   */
  async create(discountData: CreateDiscountDto): Promise<Discount> {
    const backendResponse = await apiClient.post<BackendDiscountResponse>(this.endpoint, discountData);
    return transformDiscountResponse(backendResponse);
  }

  /**
   * Cập nhật discount
   */
  async update(id: number, discountData: UpdateDiscountDto): Promise<Discount> {
    const backendResponse = await apiClient.patch<BackendDiscountResponse>(`${this.endpoint}/${id}`, discountData);
    return transformDiscountResponse(backendResponse);
  }

  /**
   * Xóa discount
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Xóa nhiều discount
   */
  async bulkDelete(ids: number[]): Promise<BulkDeleteResponse> {
    return apiClient.delete<BulkDeleteResponse>(`${this.endpoint}/bulk`, { 
      ids: ids
    });
  }

  /**
   * Test API connection
   */
  async ping(): Promise<{ message: string }> {
    return apiClient.get<{ message: string }>(`${this.endpoint}/test/ping`);
  }
}

// Export singleton instance
export const discountService = new DiscountService(); 