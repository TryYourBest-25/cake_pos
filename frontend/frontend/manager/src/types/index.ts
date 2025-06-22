// Import các types chính từ api.ts để tránh trùng lặp
export type {
  Manager,
  Employee,
  Customer,
  MembershipType,
  Order,
  OrderItem,
  CreateManagerDto,
  UpdateManagerDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateCustomerDto,
  UpdateCustomerDto,
  CreateMembershipTypeDto,
  UpdateMembershipTypeDto,
  BulkDeleteManagerDto,
  BulkDeleteEmployeeDto,
  BulkDeleteCustomerDto,
  ApiResponse,
  PaginatedResponse
} from './api';

// User Role Types
export type UserRole = 'MANAGER' | 'EMPLOYEE' | 'CUSTOMER';

export interface Permission {
  id: string;
  name: string;
  description: string;
}

// Product Management Types (chưa có trong backend)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  category: Category;
  sizes: ProductSize[];
  images: string[];
  isActive: boolean;
  stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  children?: Category[];
  products?: Product[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSize {
  id: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Order status và payment types (enum alternatives)
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CARD' | 'DIGITAL_WALLET' | 'BANK_TRANSFER';

// Navigation Types
export interface NavItem {
  title: string;
  href?: string;
  icon?: string;
  children?: NavItem[];
  isExpanded?: boolean;
}

// Form Types
export interface FormState {
  isLoading: boolean;
  errors: Record<string, string>;
  success?: string;
}

// Dashboard Types
export interface DashboardStats {
  todayRevenue: number;
  newOrders: number;
  productsSold: number;
  newCustomers: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface TopProduct {
  id: string;
  name: string;
  soldQuantity: number;
  revenue: number;
} 