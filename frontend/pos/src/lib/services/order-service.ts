import { apiClient } from '@/lib/api-client';

export interface CreateOrderDto {
  employee_id: number;
  customer_id?: number;
  customize_note?: string;
  products: {
    product_price_id: number;
    quantity: number;
    option?: string;
  }[];
  discounts?: {
    discount_id: number;
  }[];
}

export interface Order {
  order_id: number;
  customer_id?: number;
  employee_id?: number;
  order_time?: string;
  total_amount?: number;
  final_amount?: number;
  status?: 'PROCESSING' | 'CANCELLED' | 'COMPLETED';
  customize_note?: string;
  created_at?: string;
  updated_at?: string;
  customer?: any;
  employee?: any;
  order_product?: any[];
  order_discount?: any[];
  payment?: any[];
}

export const orderService = {
  /**
   * Tạo đơn hàng mới
   */
  async createOrder(data: CreateOrderDto): Promise<Order> {
    try {
      console.log('Tạo đơn hàng với dữ liệu:', data);
      
      const response = await apiClient.post<Order>('/orders', data);
      
      console.log('Đơn hàng đã được tạo:', response);
      
      return response;
    } catch (error: any) {
      console.error('Lỗi khi tạo đơn hàng:', error);
      
      // Ném lỗi để xử lý ở component
      throw error;
    }
  },

  /**
   * Lấy đơn hàng theo ID
   */
  async getOrderById(orderId: number): Promise<Order> {
    try {
      console.log('Lấy đơn hàng với ID:', orderId);
      
      const response = await apiClient.get<Order>(`/orders/${orderId}`);
      
      console.log('Thông tin đơn hàng:', response);
      
      return response;
    } catch (error: any) {
      console.error('Lỗi khi lấy đơn hàng:', error);
      throw error;
    }
  },

  /**
   * Hủy đơn hàng
   */
  async cancelOrder(orderId: number): Promise<Order> {
    try {
      console.log('Hủy đơn hàng với ID:', orderId);
      
      const response = await apiClient.patch<Order>(`/orders/${orderId}/cancel`);
      
      console.log('Đơn hàng đã được hủy:', response);
      
      return response;
    } catch (error: any) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      throw error;
    }
  },
}; 