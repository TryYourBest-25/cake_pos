import { apiClient } from '../api-client';
import { 
  Store, 
  CreateStoreDto,
  UpdateStoreDto,
  BackendStoreResponse, 
  BackendPaginatedResponse,
  transformStoreResponse 
} from '@/types/api';

class StoreService {
  /**
   * Lấy thông tin cửa hàng mặc định
   */
  async getDefaultStore(): Promise<Store> {
    try {
      const response = await apiClient.get<BackendStoreResponse>('/stores/default');
      return transformStoreResponse(response);
    } catch (error) {
      console.error('Lỗi lấy thông tin cửa hàng mặc định:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin cửa hàng theo ID
   */
  async getStoreById(id: number): Promise<Store> {
    try {
      const response = await apiClient.get<BackendStoreResponse>(`/stores/${id}`);
      return transformStoreResponse(response);
    } catch (error) {
      console.error('Lỗi lấy thông tin cửa hàng:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tất cả cửa hàng với pagination
   */
  async getAllStores(page = 1, limit = 10): Promise<{
    stores: Store[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const response = await apiClient.get<BackendPaginatedResponse<BackendStoreResponse>>(
        '/stores', 
        { page, limit }
      );
      
      return {
        stores: response.data.map(transformStoreResponse),
        pagination: response.pagination,
      };
    } catch (error) {
      console.error('Lỗi lấy danh sách cửa hàng:', error);
      throw error;
    }
  }

  /**
   * Tạo cửa hàng mới
   */
  async createStore(data: CreateStoreDto): Promise<Store> {
    try {
      const response = await apiClient.post<BackendStoreResponse>('/stores', data);
      return transformStoreResponse(response);
    } catch (error) {
      console.error('Lỗi tạo cửa hàng:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin cửa hàng
   */
  async updateStore(id: number, data: UpdateStoreDto): Promise<Store> {
    try {
      const response = await apiClient.patch<BackendStoreResponse>(`/stores/${id}`, data);
      return transformStoreResponse(response);
    } catch (error) {
      console.error('Lỗi cập nhật cửa hàng:', error);
      throw error;
    }
  }

  /**
   * Xóa cửa hàng
   */
  async deleteStore(id: number): Promise<void> {
    try {
      await apiClient.delete(`/stores/${id}`);
    } catch (error) {
      console.error('Lỗi xóa cửa hàng:', error);
      throw error;
    }
  }
}

export const storeService = new StoreService(); 