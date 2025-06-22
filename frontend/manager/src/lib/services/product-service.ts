import { apiClient } from "@/lib/api-client";
import { 
  Product, 
  ProductPrice,
  BackendProductResponse,
  BackendProductPriceResponse,
  BackendPaginatedResponse,
  BulkDeleteResponse,
  transformProductResponse,
  transformProductPriceResponse,
  PaginatedResponse 
} from "@/types/api";
import { 
  transformCreateProductFormData, 
  transformUpdateProductFormData,
  CreateProductFormData,
  UpdateProductFormData,
  CreateProductPriceFormData,
  UpdateProductPriceFormData,
  BulkDeleteProductFormData 
} from "@/lib/validations/product";

/**
 * Product Service
 * Xử lý tất cả API calls liên quan đến products
 */
export class ProductService {
  private readonly endpoint = "/products";

  /**
   * Lấy danh sách products với pagination
   */
  async getAll(params?: { 
    page?: number; 
    limit?: number;
    search?: string;
    category_id?: number;
    is_signature?: boolean;
  }): Promise<PaginatedResponse<Product>> {
    const backendResponse = await apiClient.get<BackendPaginatedResponse<BackendProductResponse>>(
      this.endpoint, 
      params
    );
    
    // Transform backend response sang frontend format
    return {
      data: backendResponse.data.map(transformProductResponse),
      total: backendResponse.pagination.total,
      page: backendResponse.pagination.page,
      limit: backendResponse.pagination.limit,
      totalPages: backendResponse.pagination.totalPages,
    };
  }

  /**
   * Lấy product theo ID
   */
  async getById(id: number): Promise<Product> {
    const backendResponse = await apiClient.get<BackendProductResponse>(`${this.endpoint}/${id}`);
    return transformProductResponse(backendResponse);
  }

  /**
   * Lấy products theo category ID
   */
  async getByCategory(categoryId: number, params?: { 
    page?: number; 
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Product>> {
    const backendResponse = await apiClient.get<BackendPaginatedResponse<BackendProductResponse>>(
      `${this.endpoint}/category/${categoryId}`, 
      params
    );
    
    // Transform backend response sang frontend format
    return {
      data: backendResponse.data.map(transformProductResponse),
      total: backendResponse.pagination.total,
      page: backendResponse.pagination.page,
      limit: backendResponse.pagination.limit,
      totalPages: backendResponse.pagination.totalPages,
    };
  }

  /**
   * Tạo product mới
   */
  async create(formData: CreateProductFormData): Promise<Product> {
    const backendData = transformCreateProductFormData(formData);
    const backendResponse = await apiClient.post<BackendProductResponse>(this.endpoint, backendData);
    return transformProductResponse(backendResponse);
  }

  /**
   * Cập nhật product
   */
  async update(id: number, formData: UpdateProductFormData): Promise<Product> {
    const backendData = transformUpdateProductFormData(formData);
    const backendResponse = await apiClient.patch<BackendProductResponse>(`${this.endpoint}/${id}`, backendData);
    return transformProductResponse(backendResponse);
  }

  /**
   * Xóa product
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Xóa nhiều products
   */
  async bulkDelete(formData: BulkDeleteProductFormData): Promise<BulkDeleteResponse> {
    return apiClient.delete<BulkDeleteResponse>(`${this.endpoint}/bulk`, formData);
  }

  /**
   * Test API connection
   */
  async ping(): Promise<{ message: string }> {
    return apiClient.get<{ message: string }>(`${this.endpoint}/admin/test`);
  }

  /**
   * Lấy thống kê products
   */
  async getStats(): Promise<{
    total: number;
    signature: number;
    withCategory: number;
    withoutCategory: number;
    recentlyCreated: number;
  }> {
    return apiClient.get<{
      total: number;
      signature: number;
      withCategory: number;
      withoutCategory: number;
      recentlyCreated: number;
    }>(`${this.endpoint}/stats`);
  }

  /**
   * Upload product image
   */
  async uploadImage(file: File): Promise<{ image_path: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    return apiClient.post<{ image_path: string }>(`${this.endpoint}/upload-image`, formData);
  }

  // === PRODUCT PRICE MANAGEMENT ===

  /**
   * Lấy danh sách giá của sản phẩm
   */
  async getProductPrices(productId: number): Promise<ProductPrice[]> {
    const backendResponse = await apiClient.get<BackendProductPriceResponse[]>(`${this.endpoint}/${productId}/prices`);
    return backendResponse.map(transformProductPriceResponse);
  }

  /**
   * Tạo giá mới cho sản phẩm
   */
  async createProductPrice(formData: CreateProductPriceFormData): Promise<ProductPrice> {
    const backendResponse = await apiClient.post<BackendProductPriceResponse>(`${this.endpoint}/prices`, formData);
    return transformProductPriceResponse(backendResponse);
  }

  /**
   * Cập nhật giá sản phẩm
   */
  async updateProductPrice(priceId: number, formData: UpdateProductPriceFormData): Promise<ProductPrice> {
    const backendResponse = await apiClient.patch<BackendProductPriceResponse>(`${this.endpoint}/prices/${priceId}`, formData);
    return transformProductPriceResponse(backendResponse);
  }

  /**
   * Xóa giá sản phẩm
   */
  async deleteProductPrice(priceId: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/prices/${priceId}`);
  }

  /**
   * Xóa nhiều giá sản phẩm
   */
  async bulkDeleteProductPrices(priceIds: number[]): Promise<BulkDeleteResponse> {
    return apiClient.delete<BulkDeleteResponse>(`${this.endpoint}/prices/bulk`, { ids: priceIds });
  }
}

// Export singleton instance
export const productService = new ProductService(); 