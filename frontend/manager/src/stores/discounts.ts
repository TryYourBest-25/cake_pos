import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { discountService } from '@/lib/services/discount-service';
import { Discount, CreateDiscountDto, UpdateDiscountDto, PaginatedResponse } from '@/types/api';

interface DiscountState {
  // Data
  discounts: Discount[];
  currentDiscount: Discount | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Search and filters
  searchQuery: string;
  isActiveFilter: boolean | null;
  
  // Actions
  fetchDiscounts: (params?: { page?: number; limit?: number; refresh?: boolean }) => Promise<void>;
  fetchDiscountById: (id: number) => Promise<void>;
  fetchDiscountByCouponCode: (couponCode: string) => Promise<Discount>;
  createDiscount: (data: CreateDiscountDto) => Promise<void>;
  updateDiscount: (id: number, data: UpdateDiscountDto) => Promise<void>;
  deleteDiscount: (id: number) => Promise<void>;
  bulkDeleteDiscounts: (ids: number[]) => Promise<any>;
  
  // UI Actions
  setSearchQuery: (query: string) => void;
  setIsActiveFilter: (isActive: boolean | null) => void;
  setCurrentDiscount: (discount: Discount | null) => void;
  resetState: () => void;
}

const initialState = {
  discounts: [],
  currentDiscount: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  searchQuery: '',
  isActiveFilter: null,
};

export const useDiscountsStore = create<DiscountState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchDiscounts: async (params = {}) => {
        const { page = 1, limit = 10, refresh = false } = params;
        const { searchQuery, isActiveFilter } = get();
        
        try {
          set({ isLoading: true });
          
          const response: PaginatedResponse<Discount> = await discountService.getAll({
            page,
            limit,
            search: searchQuery || undefined,
            isActive: isActiveFilter ?? undefined,
          });
          
          set({
            discounts: refresh ? response.data : response.data,
            pagination: {
              page: response.page,
              limit: response.limit,
              total: response.total,
              totalPages: response.totalPages,
            },
            isLoading: false,
          });
        } catch (error) {
          console.error('Lỗi lấy danh sách khuyến mãi:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      fetchDiscountById: async (id: number) => {
        try {
          set({ isLoading: true });
          const discount = await discountService.getById(id);
          set({ 
            currentDiscount: discount,
            isLoading: false 
          });
        } catch (error) {
          console.error('Lỗi lấy thông tin khuyến mãi:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      fetchDiscountByCouponCode: async (couponCode: string) => {
        try {
          const discount = await discountService.getByCouponCode(couponCode);
          return discount;
        } catch (error) {
          console.error('Lỗi lấy thông tin khuyến mãi theo mã:', error);
          throw error;
        }
      },

      createDiscount: async (data: CreateDiscountDto) => {
        try {
          set({ isCreating: true });
          const newDiscount = await discountService.create(data);
          
          // Thêm discount mới vào đầu danh sách
          set((state) => ({
            discounts: [newDiscount, ...state.discounts],
            pagination: {
              ...state.pagination,
              total: state.pagination.total + 1,
            },
            isCreating: false,
          }));
        } catch (error) {
          console.error('Lỗi tạo khuyến mãi:', error);
          set({ isCreating: false });
          throw error;
        }
      },

      updateDiscount: async (id: number, data: UpdateDiscountDto) => {
        try {
          set({ isUpdating: true });
          const updatedDiscount = await discountService.update(id, data);
          
          // Cập nhật discount trong danh sách
          set((state) => ({
            discounts: state.discounts.map((discount) =>
              discount.id === id ? updatedDiscount : discount
            ),
            currentDiscount: state.currentDiscount?.id === id ? updatedDiscount : state.currentDiscount,
            isUpdating: false,
          }));
        } catch (error) {
          console.error('Lỗi cập nhật khuyến mãi:', error);  
          set({ isUpdating: false });
          throw error;
        }
      },

      deleteDiscount: async (id: number) => {
        try {
          set({ isDeleting: true });
          await discountService.delete(id);
          
          // Xóa discount khỏi danh sách
          set((state) => ({
            discounts: state.discounts.filter((discount) => discount.id !== id),
            currentDiscount: state.currentDiscount?.id === id ? null : state.currentDiscount,
            pagination: {
              ...state.pagination,
              total: Math.max(0, state.pagination.total - 1),
            },
            isDeleting: false,
          }));
        } catch (error) {
          console.error('Lỗi xóa khuyến mãi:', error);
          set({ isDeleting: false });
          throw error;
        }
      },

      bulkDeleteDiscounts: async (ids: number[]) => {
        try {
          set({ isDeleting: true });
          const result = await discountService.bulkDelete(ids);
          
          // Xóa các discount đã xóa thành công khỏi danh sách
          set((state) => ({
            discounts: state.discounts.filter((discount) => !result.deleted.includes(discount.id)),
            pagination: {
              ...state.pagination,
              total: Math.max(0, state.pagination.total - result.deleted.length),
            },
            isDeleting: false,
          }));
          
          return result;
        } catch (error) {
          console.error('Lỗi xóa nhiều khuyến mãi:', error);
          set({ isDeleting: false });
          throw error;
        }
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setIsActiveFilter: (isActive: boolean | null) => {
        set({ isActiveFilter: isActive });
      },

      setCurrentDiscount: (discount: Discount | null) => {
        set({ currentDiscount: discount });
      },

      resetState: () => {
        set({ ...initialState });
      },
    }),
    {
      name: 'discounts-store',
    }
  )
); 