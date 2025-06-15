// Types dựa trên API controllers

export interface Manager {
  id: number;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions?: string[];
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  position?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  managerId?: number;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  dateOfBirth?: Date;
  isActive: boolean;
  membershipTypeId?: number;
  createdAt: Date;
  updatedAt: Date;
  totalSpent?: number;
  visitCount?: number;
}

// DTOs for API requests
export interface CreateManagerDto {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  permissions?: string[];
}

export interface UpdateManagerDto {
  name?: string;
  email?: string;
  password?: string;
  avatar?: string;
  isActive?: boolean;
  permissions?: string[];
}

export interface CreateEmployeeDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  position?: string;
  managerId?: number;
}

export interface UpdateEmployeeDto {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  avatar?: string;
  position?: string;
  isActive?: boolean;
  managerId?: number;
}

export interface CreateCustomerDto {
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  dateOfBirth?: Date;
  membershipTypeId?: number;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  dateOfBirth?: Date;
  isActive?: boolean;
  membershipTypeId?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 