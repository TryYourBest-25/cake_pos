"use client";

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Employee, PaginatedResponse } from '@/types/api';
import { employeeService } from '@/lib/services/employee-service';
import { 
  CreateEmployeeFormData, 
  UpdateEmployeeFormData,
  BulkDeleteEmployeeFormData 
} from '@/lib/validations/employee';
import { toast } from 'sonner';

interface EmployeeState {
  // State
  employees: Employee[];
  selectedEmployees: Employee[];
  currentEmployee: Employee | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Selection
  selectedIds: Set<number>;
  
  // Actions
  fetchEmployees: (params?: { page?: number; limit?: number; search?: string }) => Promise<void>;
  fetchEmployeeById: (id: number) => Promise<void>;
  createEmployee: (data: CreateEmployeeFormData) => Promise<Employee | null>;
  updateEmployee: (id: number, data: UpdateEmployeeFormData) => Promise<Employee | null>;
  deleteEmployee: (id: number) => Promise<boolean>;
  bulkDeleteEmployees: (data: BulkDeleteEmployeeFormData) => Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }>;
  
  // Selection actions
  selectEmployee: (id: number) => void;
  deselectEmployee: (id: number) => void;
  selectAllEmployees: () => void;
  deselectAllEmployees: () => void;
  
  // UI actions
  setCurrentEmployee: (employee: Employee | null) => void;
  clearError: () => void;
  resetState: () => void;
}

const initialState = {
  employees: [],
  selectedEmployees: [],
  currentEmployee: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  selectedIds: new Set<number>(),
};

export const useEmployeeStore = create<EmployeeState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchEmployees: async (params = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const { page = 1, limit = 10, search } = params;
          const response: PaginatedResponse<Employee> = await employeeService.getAll({
            page,
            limit,
            search,
          });
          
          set({
            employees: response.data,
            currentPage: response.page,
            totalPages: response.totalPages,
            totalItems: response.total,
            itemsPerPage: response.limit,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể tải danh sách nhân viên';
          set({ 
            error: errorMessage, 
            isLoading: false,
            employees: [],
          });
          toast.error(errorMessage);
        }
      },

      fetchEmployeeById: async (id: number) => {
        set({ isLoading: true, error: null });
        
        try {
          const employee = await employeeService.getById(id);
          set({
            currentEmployee: employee,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể tải thông tin nhân viên';
          set({ 
            error: errorMessage, 
            isLoading: false,
            currentEmployee: null,
          });
          toast.error(errorMessage);
        }
      },

      createEmployee: async (data: CreateEmployeeFormData) => {
        set({ isCreating: true, error: null });
        
        try {
          const newEmployee = await employeeService.create(data);
          
          // Thêm employee mới vào đầu danh sách
          set((state) => ({
            employees: [newEmployee, ...state.employees],
            totalItems: state.totalItems + 1,
            isCreating: false,
          }));
          
          toast.success('Tạo nhân viên thành công');
          return newEmployee;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể tạo nhân viên mới';
          set({ 
            error: errorMessage, 
            isCreating: false,
          });
          toast.error(errorMessage);
          return null;
        }
      },

      updateEmployee: async (id: number, data: UpdateEmployeeFormData) => {
        set({ isUpdating: true, error: null });
        
        try {
          const updatedEmployee = await employeeService.update(id, data);
          
          set((state) => ({
            employees: state.employees.map(emp => 
              emp.id === id ? updatedEmployee : emp
            ),
            currentEmployee: state.currentEmployee?.id === id ? updatedEmployee : state.currentEmployee,
            isUpdating: false,
          }));
          
          toast.success('Cập nhật nhân viên thành công');
          return updatedEmployee;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể cập nhật thông tin nhân viên';
          set({ 
            error: errorMessage, 
            isUpdating: false,
          });
          toast.error(errorMessage);
          return null;
        }
      },

      deleteEmployee: async (id: number) => {
        set({ isDeleting: true, error: null });
        
        try {
          await employeeService.delete(id);
          
          set((state) => ({
            employees: state.employees.filter(emp => emp.id !== id),
            totalItems: Math.max(0, state.totalItems - 1),
            selectedIds: new Set([...state.selectedIds].filter(selectedId => selectedId !== id)),
            currentEmployee: state.currentEmployee?.id === id ? null : state.currentEmployee,
            isDeleting: false,
          }));
          
          toast.success('Xóa nhân viên thành công');
          return true;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể xóa nhân viên';
          set({ 
            error: errorMessage, 
            isDeleting: false,
          });
          toast.error(errorMessage);
          return false;
        }
      },

      bulkDeleteEmployees: async (data: BulkDeleteEmployeeFormData) => {
        set({ isDeleting: true, error: null });
        
        try {
          const result = await employeeService.bulkDelete(data);
          
          set((state) => ({
            employees: state.employees.filter(emp => !result.deleted.includes(emp.id)),
            totalItems: Math.max(0, state.totalItems - result.deleted.length),
            selectedIds: new Set(),
            isDeleting: false,
          }));
          
          return result;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể xóa các nhân viên đã chọn';
          set({ 
            error: errorMessage, 
            isDeleting: false,
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Selection actions
      selectEmployee: (id: number) => {
        set((state) => ({
          selectedIds: new Set([...state.selectedIds, id]),
        }));
      },

      deselectEmployee: (id: number) => {
        set((state) => {
          const newSelected = new Set(state.selectedIds);
          newSelected.delete(id);
          return { selectedIds: newSelected };
        });
      },

      selectAllEmployees: () => {
        set((state) => ({
          selectedIds: new Set(state.employees.map(emp => emp.id)),
        }));
      },

      deselectAllEmployees: () => {
        set({ selectedIds: new Set() });
      },

      // UI actions
      setCurrentEmployee: (employee: Employee | null) => {
        set({ currentEmployee: employee });
      },

      clearError: () => {
        set({ error: null });
      },

      resetState: () => {
        set(initialState);
      },
    }),
    { name: 'employee-store' }
  )
); 