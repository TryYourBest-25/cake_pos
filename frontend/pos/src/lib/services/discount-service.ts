import { apiClient } from '@/lib/api-client';

export interface Discount {
  discount_id: number;
  name: string;
  description?: string;
  coupon_code: string;
  discount_value: number;
  min_required_order_value: number;
  max_discount_amount: number;
  min_required_product?: number;
  valid_from?: string;
  valid_until: string;
  current_uses?: number;
  max_uses?: number;
  max_uses_per_customer?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ValidateDiscountDto {
  customer_id?: number;
  discount_ids: number[];
  total_amount: number;
  product_count: number;
}

export interface ValidateDiscountResponse {
  valid_discounts: Array<{
    discount_id: number;
    discount_name: string;
    discount_amount: number;
    reason: string;
  }>;
  invalid_discounts: Array<{
    discount_id: number;
    discount_name: string;
    reason: string;
  }>;
  summary: {
    total_checked: number;
    valid_count: number;
    invalid_count: number;
    total_discount_amount: number;
  };
}

export const discountService = {
  /**
   * Tìm discount theo coupon code
   */
  async findByCouponCode(couponCode: string): Promise<Discount | null> {
    try {
      console.log('Tìm kiếm discount với coupon code:', couponCode);
      
      const response = await apiClient.get<Discount | null>(`/discounts/coupon/${couponCode}`);
      
      console.log('API response:', response);
      
      if (response === null) {
        console.log('Không tìm thấy discount với coupon code:', couponCode);
        return null;
      }
      
      return response;
    } catch (error: any) {
      console.error('Lỗi khi tìm discount:', error);
      
      // Nếu lỗi 404 thì trả về null (không tìm thấy)
      if (error?.response?.status === 404) {
        return null;
      }
      
      // Ném lỗi khác để xử lý ở component
      throw error;
    }
  },

  /**
   * Validate discount cho đơn hàng hiện tại
   */
  async validateDiscounts(data: ValidateDiscountDto): Promise<ValidateDiscountResponse> {
    try {
      console.log('Validate discounts với dữ liệu:', data);
      
      const response = await apiClient.post<ValidateDiscountResponse>('/orders/validate-discounts', data);
      
      console.log('Validate discounts response:', response);
      
      return response;
    } catch (error: any) {
      console.error('Lỗi khi validate discounts:', error);
      
      // Ném lỗi để xử lý ở component
      throw error;
    }
  },
}; 