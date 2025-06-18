import { apiClient } from '../api-client';
import { 
  Category, 
  PaginatedResult, 
  PaginationDto,
  transformCategory 
} from '@/types/api';

export class CategoryService {
  private static readonly BASE_URL = '/categories';

  static async getAll(pagination?: PaginationDto): Promise<PaginatedResult<Category>> {
    try {
      const params: Record<string, any> = {};
      if (pagination?.page) params.page = pagination.page;
      if (pagination?.limit) params.limit = pagination.limit;
      
      console.log('🔍 CategoryService.getAll - Request params:', params);
      const response = await apiClient.get(this.BASE_URL, params) as any;
      console.log('✅ CategoryService.getAll - Response:', response);
      
      // Check response structure
      if (!response || !response.data) {
        console.error('❌ Invalid response structure:', response);
        throw new Error('Cấu trúc phản hồi không hợp lệ');
      }

      return {
        data: (response.data || []).map(transformCategory),
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
      console.error('❌ Lỗi khi lấy danh sách danh mục:', {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      });
      throw new Error(error.message || 'Không thể lấy danh sách danh mục');
    }
  }

  static async getById(id: number): Promise<Category> {
    try {
      console.log(`🔍 CategoryService.getById(${id})`);
      const response = await apiClient.get(`${this.BASE_URL}/${id}`) as any;
      console.log(`✅ CategoryService.getById(${id}) - Response:`, response);
      
      // Check response structure
      if (!response) {
        console.error('❌ Invalid response structure:', response);
        throw new Error('Cấu trúc phản hồi không hợp lệ');
      }

      // Response có thể là object trực tiếp hoặc trong response.data
      const data = response.data || response;
      return transformCategory(data);
    } catch (error: any) {
      console.error(`❌ Lỗi khi lấy danh mục ${id}:`, {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      });
      throw new Error(error.message || 'Không thể lấy thông tin danh mục');
    }
  }
}

export const categoryService = CategoryService; 