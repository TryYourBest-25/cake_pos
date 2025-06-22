import { create } from 'zustand';
import { Profile, UpdateProfileDto } from '@/types/api';
import { profileService } from '@/lib/services/profile-service';

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileDto) => Promise<void>;
  clearProfile: () => void;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  isUpdating: false,
  error: null,

  fetchProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      const profile = await profileService.getProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      console.error('Lỗi fetch profile:', error);
      set({ 
        error: 'Không thể tải thông tin profile', 
        isLoading: false 
      });
      throw error;
    }
  },

  updateProfile: async (data: UpdateProfileDto) => {
    try {
      set({ isUpdating: true, error: null });
      const updatedProfile = await profileService.updateProfile(data);
      set({ 
        profile: updatedProfile, 
        isUpdating: false 
      });
    } catch (error) {
      console.error('Lỗi update profile:', error);
      set({ 
        error: 'Không thể cập nhật thông tin profile', 
        isUpdating: false 
      });
      throw error;
    }
  },

  clearProfile: () => {
    set({ 
      profile: null, 
      error: null 
    });
  },

  clearError: () => {
    set({ error: null });
  },
})); 