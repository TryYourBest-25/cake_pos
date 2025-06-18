import { apiClient } from '@/lib/api-client';

export interface MembershipType {
  membership_type_id: number;
  type: string;
  discount_value: number;
  required_point: number;
  description?: string;
  valid_until?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  customer_id: number;
  membership_type_id: number;
  account_id?: number;
  last_name?: string;
  first_name?: string;
  phone: string;
  current_points?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  created_at?: string;
  updated_at?: string;
  membership_type?: MembershipType;
}

export interface CreateCustomerDto {
  phone: string;
  last_name?: string;
  first_name?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  username?: string;
}

export const customerService = {
  /**
   * Tìm kiếm khách hàng theo số điện thoại
   */
  async findByPhone(phone: string): Promise<Customer | null> {
    try {
      console.log('Tìm kiếm khách hàng với SĐT:', phone);
      
      const response = await apiClient.get<Customer | null>(`/customers/phone/${phone}`);
      
      console.log('API response:', response);
      
      // Backend trả về null khi không tìm thấy
      if (response === null) {
        console.log('Không tìm thấy khách hàng với SĐT:', phone);
        return null;
      }
      
      return response;
    } catch (error: any) {
      console.error('Lỗi khi tìm khách hàng:', error);
      
      // Nếu lỗi 404 thì trả về null (không tìm thấy)
      if (error?.response?.status === 404) {
        return null;
      }
      
      // Ném lỗi khác để xử lý ở component
      throw error;
    }
  },

  /**
   * Tạo khách hàng mới
   */
  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    try {
      console.log('Tạo khách hàng mới với dữ liệu:', data);
      
      const response = await apiClient.post<Customer>('/customers', data);
      
      console.log('Tạo khách hàng thành công:', response);
      
      return response;
    } catch (error: any) {
      console.error('Lỗi khi tạo khách hàng:', error);
      
      // Ném lỗi để xử lý ở component
      throw error;
    }
  },
}; 