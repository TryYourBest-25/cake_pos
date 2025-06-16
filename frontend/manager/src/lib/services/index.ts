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
export { authService } from './auth-service';

// Service types
export type { 
  Manager,
  Employee,
  Customer,
  MembershipType,
  CreateManagerDto,
  UpdateManagerDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateCustomerDto,
  UpdateCustomerDto,
  CreateMembershipTypeDto,
  UpdateMembershipTypeDto,
  PaginatedResponse
} from '@/types/api'; 