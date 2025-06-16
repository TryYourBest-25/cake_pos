"use client";

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { MembershipType, PaginatedResponse } from '@/types/api';
import { membershipTypeService } from '@/lib/services/membership-type-service';
import { 
  CreateMembershipTypeFormData, 
  UpdateMembershipTypeFormData 
} from '@/lib/validations/membership-type';
import { toast } from 'sonner';

interface MembershipTypeState {
  // State
  membershipTypes: MembershipType[];
  selectedMembershipTypes: MembershipType[];
  currentMembershipType: MembershipType | null;
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
  fetchMembershipTypes: (params?: { page?: number; limit?: number; includeCustomers?: boolean }) => Promise<void>;
  fetchMembershipTypeById: (id: number, includeCustomers?: boolean) => Promise<void>;
  fetchMembershipTypeByType: (type: string, includeCustomers?: boolean) => Promise<void>;
  createMembershipType: (data: CreateMembershipTypeFormData) => Promise<MembershipType | null>;
  updateMembershipType: (id: number, data: UpdateMembershipTypeFormData) => Promise<MembershipType | null>;
  deleteMembershipType: (id: number) => Promise<boolean>;
  
  // Selection actions
  selectMembershipType: (id: number) => void;
  deselectMembershipType: (id: number) => void;
  selectAllMembershipTypes: () => void;
  deselectAllMembershipTypes: () => void;
  
  // UI actions
  setCurrentMembershipType: (membershipType: MembershipType | null) => void;
  clearError: () => void;
  resetState: () => void;
}

const initialState = {
  membershipTypes: [],
  selectedMembershipTypes: [],
  currentMembershipType: null,
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

export const useMembershipTypeStore = create<MembershipTypeState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchMembershipTypes: async (params = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const { page = 1, limit = 10, includeCustomers = false } = params;
          const response: PaginatedResponse<MembershipType> = await membershipTypeService.getAll({
            page,
            limit,
            includeCustomers,
          });
          
          set({
            membershipTypes: response.data,
            currentPage: response.page,
            totalPages: response.totalPages,
            totalItems: response.total,
            itemsPerPage: response.limit,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể tải danh sách loại thành viên';
          set({ 
            error: errorMessage, 
            isLoading: false,
            membershipTypes: [],
          });
          toast.error(errorMessage);
        }
      },

      fetchMembershipTypeById: async (id: number, includeCustomers = false) => {
        set({ isLoading: true, error: null });
        
        try {
          const membershipType = await membershipTypeService.getById(id, includeCustomers);
          set({
            currentMembershipType: membershipType,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể tải thông tin loại thành viên';
          set({ 
            error: errorMessage, 
            isLoading: false,
            currentMembershipType: null,
          });
          toast.error(errorMessage);
        }
      },

      fetchMembershipTypeByType: async (type: string, includeCustomers = false) => {
        set({ isLoading: true, error: null });
        
        try {
          const membershipType = await membershipTypeService.getByType(type, includeCustomers);
          set({
            currentMembershipType: membershipType,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không tìm thấy loại thành viên';
          set({ 
            error: errorMessage, 
            isLoading: false,
            currentMembershipType: null,
          });
          toast.error(errorMessage);
        }
      },

      createMembershipType: async (data: CreateMembershipTypeFormData) => {
        set({ isCreating: true, error: null });
        
        try {
          const newMembershipType = await membershipTypeService.create(data);
          
          // Refresh membership types list
          const { currentPage, itemsPerPage } = get();
          await get().fetchMembershipTypes({ page: currentPage, limit: itemsPerPage });
          
          set({ isCreating: false });
          toast.success('Tạo loại thành viên thành công');
          return newMembershipType;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể tạo loại thành viên';
          set({ 
            error: errorMessage, 
            isCreating: false 
          });
          toast.error(errorMessage);
          return null;
        }
      },

      updateMembershipType: async (id: number, data: UpdateMembershipTypeFormData) => {
        set({ isUpdating: true, error: null });
        
        try {
          const updatedMembershipType = await membershipTypeService.update(id, data);
          
          // Update membership types in current list
          set((state) => ({
            membershipTypes: state.membershipTypes.map(membershipType => 
              membershipType.id === id ? updatedMembershipType : membershipType
            ),
            currentMembershipType: state.currentMembershipType?.id === id ? updatedMembershipType : state.currentMembershipType,
            isUpdating: false,
          }));
          
          toast.success('Cập nhật loại thành viên thành công');
          return updatedMembershipType;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể cập nhật loại thành viên';
          set({ 
            error: errorMessage, 
            isUpdating: false 
          });
          toast.error(errorMessage);
          return null;
        }
      },

      deleteMembershipType: async (id: number) => {
        set({ isDeleting: true, error: null });
        
        try {
          await membershipTypeService.delete(id);
          
          // Remove membership type from current list
          set((state) => ({
            membershipTypes: state.membershipTypes.filter(membershipType => membershipType.id !== id),
            selectedIds: new Set([...state.selectedIds].filter(selectedId => selectedId !== id)),
            isDeleting: false,
          }));
          
          toast.success('Xóa loại thành viên thành công');
          return true;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể xóa loại thành viên';
          set({ 
            error: errorMessage, 
            isDeleting: false 
          });
          toast.error(errorMessage);
          return false;
        }
      },

      // Selection actions
      selectMembershipType: (id: number) => {
        set((state) => {
          const newSelected = new Set(state.selectedIds);
          newSelected.add(id);
          return { selectedIds: newSelected };
        });
      },

      deselectMembershipType: (id: number) => {
        set((state) => {
          const newSelected = new Set(state.selectedIds);
          newSelected.delete(id);
          return { selectedIds: newSelected };
        });
      },

      selectAllMembershipTypes: () => {
        set((state) => ({
          selectedIds: new Set(state.membershipTypes.map(membershipType => membershipType.id)),
        }));
      },

      deselectAllMembershipTypes: () => {
        set({ selectedIds: new Set() });
      },

      // UI actions
      setCurrentMembershipType: (membershipType: MembershipType | null) => {
        set({ currentMembershipType: membershipType });
      },

      clearError: () => {
        set({ error: null });
      },

      resetState: () => {
        set(initialState);
      },
    }),
    { name: 'membership-type-store' }
  )
); 