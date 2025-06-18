import { apiClient } from '../api-client';
import { 
  Profile, 
  UpdateProfileDto, 
  BackendProfileResponse, 
  transformProfileResponse 
} from '@/types/api';

class ProfileService {
  /**
   * Lấy thông tin profile của user hiện tại
   */
  async getProfile(): Promise<Profile> {
    try {
      const response = await apiClient.get<BackendProfileResponse>('/auth/profile');
      return transformProfileResponse(response);
    } catch (error) {
      console.error('Lỗi lấy thông tin profile:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin profile của user hiện tại
   */
  async updateProfile(data: UpdateProfileDto): Promise<Profile> {
    try {
      const response = await apiClient.patch<BackendProfileResponse>('/auth/profile', data);
      return transformProfileResponse(response);
    } catch (error) {
      console.error('Lỗi cập nhật profile:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileService(); 