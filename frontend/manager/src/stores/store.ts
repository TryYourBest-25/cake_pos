import { create } from 'zustand';
import { Store, CreateStoreDto, UpdateStoreDto } from '@/types/api';
import { storeService } from '@/lib/services/store-service';

interface StoreState {
  defaultStore: Store | null;
  stores: Store[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  
  // Actions
  fetchDefaultStore: () => Promise<void>;
  fetchStores: (page?: number, limit?: number) => Promise<void>;
  fetchStoreById: (id: number) => Promise<Store>;
  createStore: (data: CreateStoreDto) => Promise<void>;
  updateStore: (id: number, data: UpdateStoreDto) => Promise<void>;
  deleteStore: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useStoreStore = create<StoreState>((set, get) => ({
  defaultStore: null,
  stores: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  pagination: null,

  fetchDefaultStore: async () => {
    try {
      set({ isLoading: true, error: null });
      const defaultStore = await storeService.getDefaultStore();
      set({ defaultStore, isLoading: false });
    } catch (error) {
      console.error('Lỗi fetch default store:', error);
      set({ 
        error: 'Không thể tải thông tin cửa hàng', 
        isLoading: false 
      });
      throw error;
    }
  },

  fetchStores: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      const result = await storeService.getAllStores(page, limit);
      set({ 
        stores: result.stores,
        pagination: result.pagination,
        isLoading: false 
      });
    } catch (error) {
      console.error('Lỗi fetch stores:', error);
      set({ 
        error: 'Không thể tải danh sách cửa hàng', 
        isLoading: false 
      });
      throw error;
    }
  },

  fetchStoreById: async (id: number) => {
    try {
      const store = await storeService.getStoreById(id);
      return store;
    } catch (error) {
      console.error('Lỗi fetch store by id:', error);
      set({ error: 'Không thể tải thông tin cửa hàng' });
      throw error;
    }
  },

  createStore: async (data: CreateStoreDto) => {
    try {
      set({ isCreating: true, error: null });
      const newStore = await storeService.createStore(data);
      const currentStores = get().stores;
      set({ 
        stores: [newStore, ...currentStores],
        isCreating: false 
      });
      
      // Refresh pagination if needed
      const { pagination } = get();
      if (pagination) {
        set({
          pagination: {
            ...pagination,
            total: pagination.total + 1,
          }
        });
      }
    } catch (error) {
      console.error('Lỗi create store:', error);
      set({ 
        error: 'Không thể tạo cửa hàng', 
        isCreating: false 
      });
      throw error;
    }
  },

  updateStore: async (id: number, data: UpdateStoreDto) => {
    try {
      set({ isUpdating: true, error: null });
      const updatedStore = await storeService.updateStore(id, data);
      
      // Update in stores list
      const currentStores = get().stores;
      const updatedStores = currentStores.map(store => 
        store.id === id ? updatedStore : store
      );
      set({ stores: updatedStores, isUpdating: false });
      
      // Update default store if it's the same
      const { defaultStore } = get();
      if (defaultStore && defaultStore.id === id) {
        set({ defaultStore: updatedStore });
      }
    } catch (error) {
      console.error('Lỗi update store:', error);
      set({ 
        error: 'Không thể cập nhật cửa hàng', 
        isUpdating: false 
      });
      throw error;
    }
  },

  deleteStore: async (id: number) => {
    try {
      set({ isDeleting: true, error: null });
      await storeService.deleteStore(id);
      
      // Remove from stores list
      const currentStores = get().stores;
      const filteredStores = currentStores.filter(store => store.id !== id);
      set({ stores: filteredStores, isDeleting: false });
      
      // Update pagination
      const { pagination } = get();
      if (pagination) {
        set({
          pagination: {
            ...pagination,
            total: pagination.total - 1,
          }
        });
      }
      
      // Clear default store if it's the deleted one
      const { defaultStore } = get();
      if (defaultStore && defaultStore.id === id) {
        set({ defaultStore: null });
      }
    } catch (error) {
      console.error('Lỗi delete store:', error);
      set({ 
        error: 'Không thể xóa cửa hàng', 
        isDeleting: false 
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
})); 