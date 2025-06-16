// Types dựa trên API controllers

// Backend response structure
export interface BackendManagerResponse {
  manager_id: number;
  account_id: number;
  last_name: string;
  first_name: string;
  gender: 'MALE' | 'FEMALE' | null;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
  account?: {
    account_id: number;
    role_id: number;
    username: string;
    is_active: boolean;
    is_locked: boolean;
    last_login: string | null;
    created_at: string;
    updated_at: string;
    role: any;
  };
}

// Frontend Manager interface (transformed)
export interface Manager {
  id: number;
  accountId: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'MALE' | 'FEMALE' | null;
  password?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions?: string[];
  username?: string;
  lastLogin?: Date;
  role?: any;
}

// Utility function để transform backend response
export function transformManagerResponse(backendManager: BackendManagerResponse): Manager {
  return {
    id: backendManager.manager_id,
    accountId: backendManager.account_id,
    name: `${backendManager.first_name} ${backendManager.last_name}`,
    firstName: backendManager.first_name,
    lastName: backendManager.last_name,
    email: backendManager.email,
    phone: backendManager.phone,
    gender: backendManager.gender,
    isActive: backendManager.account?.is_active ?? true,
    createdAt: new Date(backendManager.created_at),
    updatedAt: new Date(backendManager.updated_at),
    permissions: ['MANAGE_USERS', 'MANAGE_ORDERS', 'MANAGE_PRODUCTS'], // Mock permissions
    username: backendManager.account?.username,
    lastLogin: backendManager.account?.last_login ? new Date(backendManager.account.last_login) : undefined,
    role: backendManager.account?.role,
  };
}

// Backend response structure cho Employee
export interface BackendEmployeeResponse {
  employee_id: number;
  account_id: number;
  last_name: string;
  first_name: string;
  email: string;
  phone: string;
  position: string;
  created_at: string;
  updated_at: string;
  account?: {
    account_id: number;
    role_id: number;
    username: string;
    is_active: boolean;
    is_locked: boolean;
    last_login: string | null;
    created_at: string;
    updated_at: string;
    role: any;
  };
}

// Frontend Employee interface (transformed)
export interface Employee {
  id: number;
  accountId: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  createdAt: Date;
  updatedAt: Date;
  username?: string;
  lastLogin?: Date;
  role?: any;
}

// Utility function để transform backend employee response
export function transformEmployeeResponse(backendEmployee: BackendEmployeeResponse): Employee {
  return {
    id: backendEmployee.employee_id,
    accountId: backendEmployee.account_id,
    name: `${backendEmployee.first_name} ${backendEmployee.last_name}`,
    firstName: backendEmployee.first_name,
    lastName: backendEmployee.last_name,
    email: backendEmployee.email,
    phone: backendEmployee.phone,
    position: backendEmployee.position,
    createdAt: new Date(backendEmployee.created_at),
    updatedAt: new Date(backendEmployee.updated_at),
    username: backendEmployee.account?.username,
    lastLogin: backendEmployee.account?.last_login ? new Date(backendEmployee.account.last_login) : undefined,
    role: backendEmployee.account?.role,
  };
}

// Backend response structure cho Customer
export interface BackendCustomerResponse {
  customer_id: number;
  membership_type_id: number;
  last_name?: string;
  first_name?: string;
  phone: string;
  current_points?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  created_at: string;
  updated_at: string;
  account?: {
    account_id: number;
    role_id: number;
    username: string;
    is_active: boolean;
    is_locked: boolean;
    last_login: string | null;
    created_at: string;
    updated_at: string;
    role: any;
  };
  membership_type?: {
    membership_type_id: number;
    type: string;
    discount_value: number;
    required_point: number;
    description?: string;
    valid_until?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

// Frontend Customer interface (transformed)
export interface Customer {
  id: number;
  membershipTypeId: number;
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  currentPoints?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  createdAt: Date;
  updatedAt: Date;
  username?: string;
  lastLogin?: Date;
  role?: any;
  membershipType?: MembershipType;
}

// Utility function để transform backend customer response
export function transformCustomerResponse(backendCustomer: BackendCustomerResponse): Customer {
  return {
    id: backendCustomer.customer_id,
    membershipTypeId: backendCustomer.membership_type_id,
    name: backendCustomer.first_name && backendCustomer.last_name 
      ? `${backendCustomer.first_name} ${backendCustomer.last_name}` 
      : backendCustomer.phone,
    firstName: backendCustomer.first_name,
    lastName: backendCustomer.last_name,
    phone: backendCustomer.phone,
    currentPoints: backendCustomer.current_points,
    gender: backendCustomer.gender,
    createdAt: new Date(backendCustomer.created_at),
    updatedAt: new Date(backendCustomer.updated_at),
    username: backendCustomer.account?.username,
    lastLogin: backendCustomer.account?.last_login ? new Date(backendCustomer.account.last_login) : undefined,
    role: backendCustomer.account?.role,
    membershipType: backendCustomer.membership_type ? transformMembershipTypeResponse(backendCustomer.membership_type) : undefined,
  };
}

// Backend response structure cho MembershipType
export interface BackendMembershipTypeResponse {
  membership_type_id: number;
  type: string;
  discount_value: number;
  required_point: number;
  description?: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  customers?: BackendCustomerResponse[];
}

// Frontend MembershipType interface (transformed)
export interface MembershipType {
  id: number;
  type: string;
  discountValue: number;
  requiredPoint: number;
  description?: string;
  validUntil?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  customers?: Customer[];
}

// Utility function để transform backend membership type response
export function transformMembershipTypeResponse(backendMembershipType: BackendMembershipTypeResponse): MembershipType {
  return {
    id: backendMembershipType.membership_type_id,
    type: backendMembershipType.type,
    discountValue: backendMembershipType.discount_value,
    requiredPoint: backendMembershipType.required_point,
    description: backendMembershipType.description,
    validUntil: backendMembershipType.valid_until ? new Date(backendMembershipType.valid_until) : undefined,
    isActive: backendMembershipType.is_active,
    createdAt: new Date(backendMembershipType.created_at),
    updatedAt: new Date(backendMembershipType.updated_at),
    customers: backendMembershipType.customers?.map(transformCustomerResponse),
  };
}

// Order interface cho đơn hàng
export interface Order {
  id: number;
  customerName?: string;
  customerId?: number;
  employeeId?: number;
  totalAmount: number;
  finalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

// Order item interface
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

// DTOs for API requests (match backend structure)
export interface CreateManagerDto {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender?: 'MALE' | 'FEMALE';
  username: string;
  password: string;
}

export interface UpdateManagerDto {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE';
  username?: string;
  password?: string;
}

export interface BulkDeleteManagerDto {
  ids: number[];
}

// DTOs for API requests (match backend structure) - cập nhật Employee DTOs
export interface CreateEmployeeDto {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  username: string;
}

export interface UpdateEmployeeDto {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  position?: string;
  username?: string;
}

export interface BulkDeleteEmployeeDto {
  ids: number[];
}

// DTOs for API requests (match backend structure) - Customer DTOs
export interface CreateCustomerDto {
  membership_type_id: number;
  last_name?: string;
  first_name?: string;
  phone: string;
  current_points?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  username?: string;
}

export interface UpdateCustomerDto {
  membership_type_id?: number;
  last_name?: string;
  first_name?: string;
  phone?: string;
  current_points?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  username?: string;
}

export interface BulkDeleteCustomerDto {
  ids: number[];
}

// DTOs for API requests (match backend structure) - MembershipType DTOs
export interface CreateMembershipTypeDto {
  type: string;
  discount_value: number;
  required_point: number;
  description?: string;
  valid_until?: string;
  is_active?: boolean;
}

export interface UpdateMembershipTypeDto {
  type?: string;
  discount_value?: number;
  required_point?: number;
  description?: string;
  valid_until?: string;
  is_active?: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Frontend pagination response interface
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Backend pagination response structure (for internal service use)
export interface BackendPaginatedResponse<T> {
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

// Backend bulk delete response structure (for internal service use)
export interface BulkDeleteResponse {
  deleted: number[];
  failed: { id: number; reason: string }[];
  summary: { total: number; success: number; failed: number };
} 