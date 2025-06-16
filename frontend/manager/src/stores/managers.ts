import { create } from 'zustand';
import { Manager } from '@/types/api';
import { managerService } from '@/lib/services/manager-service';
import { CreateManagerFormData, UpdateManagerFormData } from '@/lib/validations/manager';

interface ManagersState {
  // Data
  managers: Manager[];
  selectedManager: Manager | null;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  
  // Filters
  searchQuery: string;
  filters: {
    isActive?: boolean;
    permissions?: string[];
  };
  
  // Actions
  fetchManagers: (params?: { page?: number; limit?: number }) => Promise<void>;
  fetchManagerById: (id: number) => Promise<Manager | null>;
  createManager: (data: CreateManagerFormData) => Promise<Manager>;
  updateManager: (id: number, data: UpdateManagerFormData) => Promise<Manager>;
  deleteManager: (id: number) => Promise<void>;
  bulkDeleteManagers: (ids: number[]) => Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }>;
  
  // UI Actions
  setSelectedManager: (manager: Manager | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<ManagersState['filters']>) => void;
  setPage: (page: number) => void;
  
  // Cache management
  invalidateCache: () => void;
  refreshManager: (id: number) => Promise<void>;
}

export const useManagersStore = create<ManagersState>((set, get) => ({
  // Initial state
  managers: [],
  selectedManager: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  pageSize: 10,
  searchQuery: '',
  filters: {},

  // Fetch managers with pagination
  fetchManagers: async (params) => {
    try {
      set({ isLoading: true });
      
      const { currentPage, pageSize } = get();
      const page = params?.page || currentPage;
      const limit = params?.limit || pageSize;
      
      const response = await managerService.getAll({ page, limit });
      
      set({
        managers: response.data,
        currentPage: response.page,
        totalPages: response.totalPages,
        totalCount: response.total,
        pageSize: response.limit,
        isLoading: false,
      });
      
    } catch (error) {
      console.error('Lỗi tải danh sách quản lý:', error);
      set({ isLoading: false });
      
      // Fallback to mock data for development
      set({
        managers: [
          {
            id: 1,
            accountId: 1,
            name: "Nguyễn Văn An",
            firstName: "Văn An",
            lastName: "Nguyễn",
            email: "an.nguyen@company.com",
            phone: "0901234567",
            gender: "MALE" as const,
            username: "an.nguyen",
            isActive: true,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-15"),
            permissions: ["USER_MANAGEMENT", "PRODUCT_MANAGEMENT", "ORDER_MANAGEMENT"],
            lastLogin: new Date("2024-01-15"),
          },
          {
            id: 2,
            accountId: 2,
            name: "Trần Thị Bình",
            firstName: "Thị Bình",
            lastName: "Trần",
            email: "binh.tran@company.com",
            phone: "0901234568",
            gender: "FEMALE" as const,
            username: "binh.tran",
            isActive: true,
            createdAt: new Date("2024-02-20"),
            updatedAt: new Date("2024-02-20"),
            permissions: ["PRODUCT_MANAGEMENT", "REPORT_VIEW"],
            lastLogin: new Date("2024-02-20"),
          },
          {
            id: 3,
            accountId: 3,
            name: "Lê Hoàng Cường",
            firstName: "Hoàng Cường",
            lastName: "Lê",
            email: "cuong.le@company.com",
            phone: "0901234569",
            gender: "MALE" as const,
            username: "cuong.le",
            isActive: false,
            createdAt: new Date("2024-03-10"),
            updatedAt: new Date("2024-03-10"),
            permissions: ["ORDER_MANAGEMENT"],
            lastLogin: new Date("2024-03-10"),
          },
        ],
        totalCount: 3,
        totalPages: 1,
        isLoading: false,
      });
    }
  },

  // Fetch single manager
  fetchManagerById: async (id: number) => {
    try {
      // Check cache first
      const { managers } = get();
      const cachedManager = managers.find(m => m.id === id);
      if (cachedManager) {
        set({ selectedManager: cachedManager });
        return cachedManager;
      }
      
      const manager = await managerService.getById(id);
      set({ selectedManager: manager });
      
      // Update cache
      set((state) => ({
        managers: state.managers.map(m => m.id === id ? manager : m)
      }));
      
      return manager;
    } catch (error) {
      console.error('Lỗi tải thông tin quản lý:', error);
      return null;
    }
  },

  // Create manager with optimistic update
  createManager: async (data: CreateManagerFormData) => {
    try {
      set({ isCreating: true });
      
      const newManager = await managerService.create(data);
      
      // Add to cache
      set((state) => ({
        managers: [newManager, ...state.managers],
        totalCount: state.totalCount + 1,
        isCreating: false,
      }));
      
      return newManager;
    } catch (error) {
      set({ isCreating: false });
      throw error;
    }
  },

  // Update manager with optimistic update
  updateManager: async (id: number, data: UpdateManagerFormData) => {
    try {
      set({ isUpdating: true });
      
      // Optimistic update
      const { managers } = get();
      const optimisticManagers = managers.map(manager => 
        manager.id === id 
          ? { ...manager, ...data, updatedAt: new Date() }
          : manager
      );
      set({ managers: optimisticManagers });
      
      const updatedManager = await managerService.update(id, data);
      
      // Update with real data
      set((state) => ({
        managers: state.managers.map(m => m.id === id ? updatedManager : m),
        selectedManager: state.selectedManager?.id === id ? updatedManager : state.selectedManager,
        isUpdating: false,
      }));
      
      return updatedManager;
    } catch (error) {
      // Revert optimistic update
      get().fetchManagers();
      set({ isUpdating: false });
      throw error;
    }
  },

  // Delete manager with optimistic update
  deleteManager: async (id: number) => {
    try {
      set({ isDeleting: true });
      
      // Optimistic update
      const { managers } = get();
      const optimisticManagers = managers.filter(m => m.id !== id);
      set({ 
        managers: optimisticManagers,
        totalCount: get().totalCount - 1,
      });
      
      await managerService.delete(id);
      
      set({ 
        isDeleting: false,
        selectedManager: get().selectedManager?.id === id ? null : get().selectedManager,
      });
      
    } catch (error) {
      // Revert optimistic update
      get().fetchManagers();
      set({ isDeleting: false });
      throw error;
    }
  },

  // Bulk delete managers
  bulkDeleteManagers: async (ids: number[]) => {
    try {
      set({ isDeleting: true });
      
      // Optimistic update
      const { managers } = get();
      const optimisticManagers = managers.filter(m => !ids.includes(m.id));
      set({ 
        managers: optimisticManagers,
        totalCount: get().totalCount - ids.length,
      });
      
      const result = await managerService.bulkDelete({ ids });
      
      set({ isDeleting: false });
      
      return result;
      
    } catch (error) {
      // Revert optimistic update
      get().fetchManagers();
      set({ isDeleting: false });
      throw error;
    }
  },

  // UI Actions
  setSelectedManager: (manager: Manager | null) => {
    set({ selectedManager: manager });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    // TODO: Implement search functionality
  },

  setFilters: (filters: Partial<ManagersState['filters']>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }));
    // TODO: Implement filtering
  },

  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchManagers({ page });
  },

  // Cache management
  invalidateCache: () => {
    set({ managers: [] });
  },

  refreshManager: async (id: number) => {
    try {
      const manager = await managerService.getById(id);
      set((state) => ({
        managers: state.managers.map(m => m.id === id ? manager : m),
        selectedManager: state.selectedManager?.id === id ? manager : state.selectedManager,
      }));
    } catch (error) {
      console.error('Lỗi refresh manager:', error);
    }
  },
})); 