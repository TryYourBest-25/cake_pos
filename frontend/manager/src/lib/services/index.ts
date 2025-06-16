/**
 * Services Index
 * Export tất cả services để dễ import
 */

// API Client
export { apiClient, API_CONFIG } from '@/lib/api-client';
export type { ApiResponse } from '@/lib/api-client';

// Services
export { managerService, ManagerService } from './manager-service';
export { authService, AuthService } from './auth-service';

// Service types
export type { 
  Manager,
  Employee,
  Customer,
  CreateManagerDto,
  UpdateManagerDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateCustomerDto,
  UpdateCustomerDto,
  PaginatedResponse
} from '@/types/api'; 