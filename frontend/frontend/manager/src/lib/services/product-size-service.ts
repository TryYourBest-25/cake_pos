import { apiClient } from '@/lib/api-client';
import { ProductSize, BackendPaginatedResponse, BulkDeleteResponse, transformProductSize } from '@/types/api';
import { 
  CreateProductSizeFormData, 
  UpdateProductSizeFormData,
  BulkDeleteProductSizeFormData 
} from '@/lib/validations/product-size';

export interface ProductSizeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedProductSizeResponse {
  data: ProductSize[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

class ProductSizeService {
  private readonly baseUrl = '/product-sizes';

  async getAll(params?: ProductSizeQueryParams): Promise<PaginatedProductSizeResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    const response = await apiClient.get<BackendPaginatedResponse<any>>(
      `${this.baseUrl}?${searchParams.toString()}`
    );

    return {
      data: response.data.map(transformProductSize),
      page: response.pagination.page,
      limit: response.pagination.limit,
      total: response.pagination.total,
      totalPages: response.pagination.totalPages || Math.ceil(response.pagination.total / response.pagination.limit),
    };
  }

  async getById(id: number): Promise<ProductSize> {
    const response = await apiClient.get<any>(`${this.baseUrl}/${id}`);
    return transformProductSize(response);
  }

  async create(data: CreateProductSizeFormData): Promise<ProductSize> {
    const response = await apiClient.post<any>(this.baseUrl, data);
    return transformProductSize(response);
  }

  async update(id: number, data: UpdateProductSizeFormData): Promise<ProductSize> {
    const response = await apiClient.patch<any>(`${this.baseUrl}/${id}`, data);
    return transformProductSize(response);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async bulkDelete(data: BulkDeleteProductSizeFormData): Promise<BulkDeleteResponse> {
    const response = await apiClient.post<BulkDeleteResponse>(`${this.baseUrl}/bulk-delete`, data);
    return response;
  }

  async getProductPricesBySize(sizeId: number, params?: ProductSizeQueryParams): Promise<any> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await apiClient.get<BackendPaginatedResponse<any>>(
      `${this.baseUrl}/${sizeId}/product-prices?${searchParams.toString()}`
    );

    return response;
  }
}

export const productSizeService = new ProductSizeService(); 