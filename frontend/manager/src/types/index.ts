// User Management Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Manager extends User {
  role: 'MANAGER';
  permissions: Permission[];
}

export interface Employee extends User {
  role: 'EMPLOYEE';
  storeId: string;
  position: string;
  salary?: number;
  hireDate: Date;
}

export interface Customer extends User {
  role: 'CUSTOMER';
  phone?: string;
  address?: string;
  membershipType?: MembershipType;
  totalSpent: number;
  orderCount: number;
}

export type UserRole = 'MANAGER' | 'EMPLOYEE' | 'CUSTOMER';

export interface Permission {
  id: string;
  name: string;
  description: string;
}

// Product Management Types
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

// Order Management Types
export interface Order {
  id: string;
  customerId: string;
  customer: Customer;
  employeeId?: string;
  employee?: Employee;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  sizeId?: string;
  size?: ProductSize;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CARD' | 'DIGITAL_WALLET' | 'BANK_TRANSFER';

// Membership Types
export interface MembershipType {
  id: string;
  name: string;
  description: string;
  discount: number;
  minSpentAmount: number;
  benefits: string[];
  isActive: boolean;
}

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

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
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