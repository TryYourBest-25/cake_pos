"use client";

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Customer, PaginatedResponse } from '@/types/api';
import { customerService } from '@/lib/services/customer-service';
import { 
  CreateCustomerFormData, 
  UpdateCustomerFormData,
  BulkDeleteCustomerFormData 
} from '@/lib/validations/customer';
import { toast } from 'sonner';

interface CustomerState {
  // State
  customers: Customer[];
  selectedCustomers: Customer[];
  currentCustomer: Customer | null;
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
  fetchCustomers: (params?: { page?: number; limit?: number; search?: string }) => Promise<void>;
  fetchCustomerById: (id: number) => Promise<void>;
  fetchCustomerByPhone: (phone: string) => Promise<void>;
  fetchCustomersByMembershipType: (membershipTypeId: number, params?: { page?: number; limit?: number }) => Promise<void>;
  createCustomer: (data: CreateCustomerFormData) => Promise<Customer | null>;
  updateCustomer: (id: number, data: UpdateCustomerFormData) => Promise<Customer | null>;
  deleteCustomer: (id: number) => Promise<boolean>;
  bulkDeleteCustomers: (data: BulkDeleteCustomerFormData) => Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }>;
  
  // Selection actions
  selectCustomer: (id: number) => void;
  deselectCustomer: (id: number) => void;
  selectAllCustomers: () => void;
  deselectAllCustomers: () => void;
  
  // UI actions
  setCurrentCustomer: (customer: Customer | null) => void;
  clearError: () => void;
  resetState: () => void;
}

const initialState = {
  customers: [],
  selectedCustomers: [],
  currentCustomer: null,
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

export const useCustomerStore = create<CustomerState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchCustomers: async (params = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const { page = 1, limit = 10, search } = params;
          const response: PaginatedResponse<Customer> = await customerService.getAll({
            page,
            limit,
            search,
          });
          
          set({
            customers: response.data,
            currentPage: response.page,
            totalPages: response.totalPages,
            totalItems: response.total,
            itemsPerPage: response.limit,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể tải danh sách khách hàng';
          set({ 
            error: errorMessage, 
            isLoading: false,
            customers: [],
          });
          toast.error(errorMessage);
        }
      },

      fetchCustomerById: async (id: number) => {
        set({ isLoading: true, error: null });
        
        try {
          const customer = await customerService.getById(id);
          set({
            currentCustomer: customer,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể tải thông tin khách hàng';
          set({ 
            error: errorMessage, 
            isLoading: false,
            currentCustomer: null,
          });
          toast.error(errorMessage);
        }
      },

      fetchCustomerByPhone: async (phone: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const customer = await customerService.getByPhone(phone);
          set({
            currentCustomer: customer,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không tìm thấy khách hàng với số điện thoại này';
          set({ 
            error: errorMessage, 
            isLoading: false,
            currentCustomer: null,
          });
          toast.error(errorMessage);
        }
      },

      fetchCustomersByMembershipType: async (membershipTypeId: number, params = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const { page = 1, limit = 10 } = params;
          const response: PaginatedResponse<Customer> = await customerService.getByMembershipType(membershipTypeId, {
            page,
            limit,
          });
          
          set({
            customers: response.data,
            currentPage: response.page,
            totalPages: response.totalPages,
            totalItems: response.total,
            itemsPerPage: response.limit,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể tải danh sách khách hàng theo loại thành viên';
          set({ 
            error: errorMessage, 
            isLoading: false,
            customers: [],
          });
          toast.error(errorMessage);
        }
      },

      createCustomer: async (data: CreateCustomerFormData) => {
        set({ isCreating: true, error: null });
        
        try {
          const newCustomer = await customerService.create(data);
          
          // Refresh customers list
          const { currentPage, itemsPerPage } = get();
          await get().fetchCustomers({ page: currentPage, limit: itemsPerPage });
          
          set({ isCreating: false });
          toast.success('Tạo khách hàng thành công');
          return newCustomer;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể tạo khách hàng';
          set({ 
            error: errorMessage, 
            isCreating: false 
          });
          toast.error(errorMessage);
          return null;
        }
      },

      updateCustomer: async (id: number, data: UpdateCustomerFormData) => {
        set({ isUpdating: true, error: null });
        
        try {
          const updatedCustomer = await customerService.update(id, data);
          
          // Update customers in current list
          set((state) => ({
            customers: state.customers.map(customer => 
              customer.id === id ? updatedCustomer : customer
            ),
            currentCustomer: state.currentCustomer?.id === id ? updatedCustomer : state.currentCustomer,
            isUpdating: false,
          }));
          
          toast.success('Cập nhật khách hàng thành công');
          return updatedCustomer;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể cập nhật khách hàng';
          set({ 
            error: errorMessage, 
            isUpdating: false 
          });
          toast.error(errorMessage);
          return null;
        }
      },

      deleteCustomer: async (id: number) => {
        set({ isDeleting: true, error: null });
        
        try {
          await customerService.delete(id);
          
          // Remove customer from current list
          set((state) => ({
            customers: state.customers.filter(customer => customer.id !== id),
            selectedIds: new Set([...state.selectedIds].filter(selectedId => selectedId !== id)),
            isDeleting: false,
          }));
          
          toast.success('Xóa khách hàng thành công');
          return true;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể xóa khách hàng';
          set({ 
            error: errorMessage, 
            isDeleting: false 
          });
          toast.error(errorMessage);
          return false;
        }
      },

      bulkDeleteCustomers: async (data: BulkDeleteCustomerFormData) => {
        set({ isDeleting: true, error: null });
        
        try {
          const result = await customerService.bulkDelete(data);
          
          // Remove deleted customers from current list
          set((state) => ({
            customers: state.customers.filter(customer => !result.deleted.includes(customer.id)),
            selectedIds: new Set(),
            isDeleting: false,
          }));
          
          if (result.summary.success > 0) {
            toast.success(`Đã xóa thành công ${result.summary.success} khách hàng`);
          }
          
          if (result.summary.failed > 0) {
            toast.error(`Không thể xóa ${result.summary.failed} khách hàng`);
          }
          
          return result;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể xóa khách hàng';
          set({ 
            error: errorMessage, 
            isDeleting: false 
          });
          toast.error(errorMessage);
          return {
            deleted: [],
            failed: data.ids.map(id => ({ id, reason: errorMessage })),
            summary: { total: data.ids.length, success: 0, failed: data.ids.length }
          };
        }
      },

      // Selection actions
      selectCustomer: (id: number) => {
        set((state) => {
          const newSelected = new Set(state.selectedIds);
          newSelected.add(id);
          return { selectedIds: newSelected };
        });
      },

      deselectCustomer: (id: number) => {
        set((state) => {
          const newSelected = new Set(state.selectedIds);
          newSelected.delete(id);
          return { selectedIds: newSelected };
        });
      },

      selectAllCustomers: () => {
        set((state) => ({
          selectedIds: new Set(state.customers.map(customer => customer.id)),
        }));
      },

      deselectAllCustomers: () => {
        set({ selectedIds: new Set() });
      },

      // UI actions
      setCurrentCustomer: (customer: Customer | null) => {
        set({ currentCustomer: customer });
      },

      clearError: () => {
        set({ error: null });
      },

      resetState: () => {
        set(initialState);
      },
    }),
    { name: 'customer-store' }
  )
);