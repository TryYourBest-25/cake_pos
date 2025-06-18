import { apiClient } from '../api-client';
import { 
  Product, 
  ProductPrice,
  PaginatedResult, 
  PaginationDto,
  transformProduct,
  transformProductPrice
} from '@/types/api';

export class ProductService {
  private static readonly BASE_URL = '/products';

  static async getAll(pagination?: PaginationDto): Promise<PaginatedResult<Product>> {
    try {
      const params: Record<string, any> = {};
      if (pagination?.page) params.page = pagination.page;
      if (pagination?.limit) params.limit = pagination.limit;
      
      const response = await apiClient.get(this.BASE_URL, params) as any;
      
      // Check response structure
      if (!response || !response.data) {
        throw new Error('Cấu trúc phản hồi không hợp lệ');
      }

      return {
        data: (response.data || []).map(transformProduct),
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: response.data?.length || 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (error: any) {
      throw new Error(error.message || 'Không thể lấy danh sách sản phẩm');
    }
  }

  static async getById(id: number): Promise<Product> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${id}`) as any;
      
      // Check response structure
      if (!response) {
        throw new Error('Cấu trúc phản hồi không hợp lệ');
      }

      // Response có thể là object trực tiếp hoặc trong response.data
      const data = response.data || response;
      return transformProduct(data);
    } catch (error: any) {
      throw new Error(error.message || 'Không thể lấy thông tin sản phẩm');
    }
  }

  static async getByCategory(categoryId: number, pagination?: PaginationDto): Promise<PaginatedResult<Product>> {
    try {
      const params: Record<string, any> = {};
      if (pagination?.page) params.page = pagination.page;
      if (pagination?.limit) params.limit = pagination.limit;
      
      const response = await apiClient.get(`${this.BASE_URL}/category/${categoryId}`, params) as any;
      
      // Check response structure
      if (!response || !response.data) {
        throw new Error('Cấu trúc phản hồi không hợp lệ');
      }

      return {
        data: (response.data || []).map(transformProduct),
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: response.data?.length || 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (error: any) {
      throw new Error(error.message || 'Không thể lấy sản phẩm theo danh mục');
    }
  }

  static async getProductPrices(productId: number): Promise<ProductPrice[]> {
    try {
        const response = await apiClient.get(`${this.BASE_URL}/${productId}/prices`) as any;
      
      // Check response structure
      if (!response) {
        return [];
      }

      // Response có thể là array trực tiếp hoặc trong response.data
      const data = Array.isArray(response) ? response : (response.data || []);
      return data.map(transformProductPrice);
    } catch (error: any) {
      throw new Error(error.message || 'Không thể lấy giá sản phẩm');
    }
  }
}

export const productService = ProductService; 