"use client";

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ProductSize, BulkDeleteResponse } from '@/types/api';
import { productSizeService } from '@/lib/services/product-size-service';
import { 
  CreateProductSizeFormData, 
  UpdateProductSizeFormData,
  BulkDeleteProductSizeFormData 
} from '@/lib/validations/product-size';
import { toast } from 'sonner';

interface ProductSizeState {
  // State
  productSizes: ProductSize[];
  currentProductSize: ProductSize | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  
  // Pagination
  page: number;
  limit: number;
  total: number;
  totalPages: number;

  // Actions
  fetchProductSizes: (params?: { page?: number; limit?: number; search?: string }) => Promise<void>;
  getProductSizeById: (id: number) => Promise<void>;
  createProductSize: (formData: CreateProductSizeFormData) => Promise<void>;
  updateProductSize: (id: number, formData: UpdateProductSizeFormData) => Promise<void>;
  deleteProductSize: (id: number) => Promise<void>;
  bulkDeleteProductSizes: (formData: BulkDeleteProductSizeFormData) => Promise<BulkDeleteResponse>;
  
  // Utility actions
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  productSizes: [],
  currentProductSize: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export const useProductSizeStore = create<ProductSizeState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchProductSizes: async (params) => {
        try {
          set({ isLoading: true, error: null });
          
          const { page = get().page, limit = get().limit, search } = params || {};
          
          const response = await productSizeService.getAll({ page, limit, search });
          
          set({
            productSizes: response.data,
            page: response.page,
            limit: response.limit,
            total: response.total,
            totalPages: response.totalPages,
            isLoading: false,
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Lỗi tải danh sách kích thước sản phẩm',
            isLoading: false 
          });
          toast.error('Không thể tải danh sách kích thước sản phẩm');
        }
      },

      getProductSizeById: async (id) => {
        try {
          set({ isLoading: true, error: null });
          
          const productSize = await productSizeService.getById(id);
          
          set({
            currentProductSize: productSize,
            isLoading: false,
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Lỗi tải thông tin kích thước sản phẩm',
            isLoading: false 
          });
          toast.error('Không thể tải thông tin kích thước sản phẩm');
        }
      },

      createProductSize: async (formData) => {
        try {
          set({ isCreating: true, error: null });
          
          const newProductSize = await productSizeService.create(formData);
          
          set((state) => ({
            productSizes: [newProductSize, ...state.productSizes],
            total: state.total + 1,
            isCreating: false,
          }));
          
          toast.success('Tạo kích thước sản phẩm thành công!');
        } catch (error: any) {
          set({ 
            error: error.message || 'Lỗi tạo kích thước sản phẩm',
            isCreating: false 
          });
          throw error;
        }
      },

      updateProductSize: async (id, formData) => {
        try {
          set({ isUpdating: true, error: null });
          
          const updatedProductSize = await productSizeService.update(id, formData);
          
          set((state) => ({
            productSizes: state.productSizes.map(ps => 
              ps.id === id ? updatedProductSize : ps
            ),
            currentProductSize: state.currentProductSize?.id === id 
              ? updatedProductSize 
              : state.currentProductSize,
            isUpdating: false,
          }));
          
          toast.success('Cập nhật kích thước sản phẩm thành công!');
        } catch (error: any) {
          set({ 
            error: error.message || 'Lỗi cập nhật kích thước sản phẩm',
            isUpdating: false 
          });
          throw error;
        }
      },

      deleteProductSize: async (id) => {
        try {
          set({ isDeleting: true, error: null });
          
          await productSizeService.delete(id);
          
          set((state) => ({
            productSizes: state.productSizes.filter(ps => ps.id !== id),
            total: state.total - 1,
            currentProductSize: state.currentProductSize?.id === id 
              ? null 
              : state.currentProductSize,
            isDeleting: false,
          }));
          
          toast.success('Xóa kích thước sản phẩm thành công!');
        } catch (error: any) {
          set({ 
            error: error.message || 'Lỗi xóa kích thước sản phẩm',
            isDeleting: false 
          });
          throw error;
        }
      },

      bulkDeleteProductSizes: async (formData) => {
        try {
          set({ isDeleting: true, error: null });
          
          const result = await productSizeService.bulkDelete(formData);
          
          // Refresh danh sách sau khi bulk delete
          await get().fetchProductSizes();
          
          set({ isDeleting: false });
          
          return result;
        } catch (error: any) {
          set({ 
            error: error.message || 'Lỗi xóa nhiều kích thước sản phẩm',
            isDeleting: false 
          });
          throw error;
        }
      },

      setPage: (page) => {
        set({ page });
      },

      setLimit: (limit) => {
        set({ limit, page: 1 }); // Reset về trang 1 khi thay đổi limit
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'product-size-store',
    }
  )
); 