// Re-export API types
export * from './api';

// Re-export auth types  
export * from './auth';

// Cart types for POS
export interface CartItem {
  product_price_id: number;
  product: {
    product_id: number;
    name: string;
    image_path?: string;
  };
  product_size: {
    size_id: number;
    name: string;
    unit: string;
  };
  price: number;
  quantity: number;
  total: number;
}

// Customer types for POS
export interface POSCustomer {
  customer_id: number;
  first_name?: string;
  last_name?: string;
  phone: string;
  current_points?: number;
  membership_type?: {
    type: string;
    discount_value: number;
  };
}

// Order types for POS
export interface CreateOrderRequest {
  customer_id?: number;
  items: {
    product_price_id: number;
    quantity: number;
    option?: string;
  }[];
  customize_note?: string;
}

// UI State types
export interface FormState {
  isLoading: boolean;
  error: string | null;
} 