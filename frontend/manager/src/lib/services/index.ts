/**
 * Services Index
 * Export tất cả services để dễ import
 */

// API Client
export { apiClient, API_CONFIG } from '@/lib/api-client';
export type { ApiResponse } from '@/lib/api-client';

// Services
export { managerService } from './manager-service';
export { employeeService } from './employee-service';
export { customerService } from './customer-service';
export { membershipTypeService } from './membership-type-service';
export { discountService } from './discount-service';
export { authService } from './auth-service';
export * from './reports-service';
export { profileService } from './profile-service';
export { storeService } from './store-service';
export { invoiceService } from './invoice-service';

// Service types
export type { 
  Manager,
  Employee,
  Customer,
  MembershipType,
  Discount,
  CreateManagerDto,
  UpdateManagerDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateCustomerDto,
  UpdateCustomerDto,
  CreateMembershipTypeDto,
  UpdateMembershipTypeDto,
  CreateDiscountDto,
  UpdateDiscountDto,
  PaginatedResponse,
  InvoiceData
} from '@/types/api'; 