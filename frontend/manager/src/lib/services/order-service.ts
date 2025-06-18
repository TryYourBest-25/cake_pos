import { apiClient } from "@/lib/api-client";
import { 
  PaginatedResponse, 
  BackendPaginatedResponse,
  Order, 
  BackendOrderResponse, 
  transformOrderResponse
} from "@/types/api";

/**
 * Order Service
 * Xử lý API calls liên quan đến orders
 */
export class OrderService {
  private readonly endpoint = "/orders";

  /**
   * Lấy danh sách tất cả orders với pagination và filtering
   */
  async getOrders(params?: { 
    page?: number; 
    limit?: number;
    customerId?: number;
    employeeId?: number;
    status?: 'PROCESSING' | 'CANCELLED' | 'COMPLETED';
  }): Promise<PaginatedResponse<Order>> {
    const backendResponse = await apiClient.get<BackendPaginatedResponse<BackendOrderResponse>>(
      this.endpoint, 
      params
    );
    
    return {
      data: backendResponse.data.map(transformOrderResponse),
      total: backendResponse.pagination.total,
      page: backendResponse.pagination.page,
      limit: backendResponse.pagination.limit,
      totalPages: backendResponse.pagination.totalPages,
    };
  }

  /**
   * Lấy danh sách orders theo trạng thái
   */
  async getOrdersByStatus(
    status: 'PROCESSING' | 'CANCELLED' | 'COMPLETED',
    params?: { 
      page?: number; 
      limit?: number;
    }
  ): Promise<PaginatedResponse<Order>> {
    const backendResponse = await apiClient.get<BackendPaginatedResponse<BackendOrderResponse>>(
      `${this.endpoint}/status/${status}`, 
      params
    );
    
    return {
      data: backendResponse.data.map(transformOrderResponse),
      total: backendResponse.pagination.total,
      page: backendResponse.pagination.page,
      limit: backendResponse.pagination.limit,
      totalPages: backendResponse.pagination.totalPages,
    };
  }

  /**
   * Lấy danh sách orders theo employee
   */
  async getOrdersByEmployee(
    employeeId: number,
    params?: { 
      page?: number; 
      limit?: number;
    }
  ): Promise<PaginatedResponse<Order>> {
    const backendResponse = await apiClient.get<BackendPaginatedResponse<BackendOrderResponse>>(
      `${this.endpoint}/employee/${employeeId}`, 
      params
    );
    
    return {
      data: backendResponse.data.map(transformOrderResponse),
      total: backendResponse.pagination.total,
      page: backendResponse.pagination.page,
      limit: backendResponse.pagination.limit,
      totalPages: backendResponse.pagination.totalPages,
    };
  }

  /**
   * Lấy danh sách orders theo customer
   */
  async getOrdersByCustomer(
    customerId: number,
    params?: { 
      page?: number; 
      limit?: number;
    }
  ): Promise<PaginatedResponse<Order>> {
    const backendResponse = await apiClient.get<BackendPaginatedResponse<BackendOrderResponse>>(
      `${this.endpoint}/customer/${customerId}`, 
      params
    );
    
    return {
      data: backendResponse.data.map(transformOrderResponse),
      total: backendResponse.pagination.total,
      page: backendResponse.pagination.page,
      limit: backendResponse.pagination.limit,
      totalPages: backendResponse.pagination.totalPages,
    };
  }

  /**
   * Lấy order theo ID với đầy đủ thông tin
   */
  async getById(id: number): Promise<Order> {
    const backendResponse = await apiClient.get<BackendOrderResponse>(`${this.endpoint}/${id}`);
    return transformOrderResponse(backendResponse);
  }

  /**
   * Hủy order
   */
  async cancelOrder(id: number): Promise<Order> {
    const backendResponse = await apiClient.patch<BackendOrderResponse>(`${this.endpoint}/${id}/cancel`);
    return transformOrderResponse(backendResponse);
  }

  /**
   * Xóa order (chỉ Manager)
   */
  async deleteOrder(id: number): Promise<Order> {
    const backendResponse = await apiClient.delete<BackendOrderResponse>(`${this.endpoint}/${id}`);
    return transformOrderResponse(backendResponse);
  }
}

// Export singleton instance
export const orderService = new OrderService(); 