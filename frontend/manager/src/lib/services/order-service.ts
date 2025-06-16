import { apiClient } from "@/lib/api-client";
import { PaginatedResponse } from "@/types/api";

// Order từ backend
export interface BackendOrderResponse {
  order_id: number;
  employee_id?: number;
  customer_id?: number;
  total_amount: number;
  final_amount: number;
  status: string;
  customize_note?: string;
  created_at: string;
  updated_at: string;
  customer?: any;
  employee?: any;
  order_product?: any[];
  order_discount?: any[];
  payment?: any[];
}

// Frontend Order interface
export interface Order {
  id: number;
  employeeId?: number;
  customerId?: number;
  totalAmount: number;
  finalAmount: number;
  status: string;
  customizeNote?: string;
  createdAt: Date;
  updatedAt: Date;
  customer?: any;
  employee?: any;
  products?: any[];
  discounts?: any[];
  payments?: any[];
}

// Transform function
export function transformOrderResponse(backendOrder: BackendOrderResponse): Order {
  return {
    id: backendOrder.order_id,
    employeeId: backendOrder.employee_id,
    customerId: backendOrder.customer_id,
    totalAmount: backendOrder.total_amount,
    finalAmount: backendOrder.final_amount,
    status: backendOrder.status,
    customizeNote: backendOrder.customize_note,
    createdAt: new Date(backendOrder.created_at),
    updatedAt: new Date(backendOrder.updated_at),
    customer: backendOrder.customer,
    employee: backendOrder.employee,
    products: backendOrder.order_product,
    discounts: backendOrder.order_discount,
    payments: backendOrder.payment,
  };
}

// Backend pagination response structure
interface BackendPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Order Service
 * Xử lý API calls liên quan đến orders
 */
export class OrderService {
  private readonly endpoint = "/orders";

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
   * Lấy order theo ID
   */
  async getById(id: number): Promise<Order> {
    const backendResponse = await apiClient.get<BackendOrderResponse>(`${this.endpoint}/${id}`);
    return transformOrderResponse(backendResponse);
  }
}

// Export singleton instance
export const orderService = new OrderService(); 