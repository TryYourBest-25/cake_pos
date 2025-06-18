import { apiClient } from "@/lib/api-client";
import { User, LoginCredentials, LoginResponse, RefreshTokenResponse } from "@/types/auth";

/**
 * Authentication Service
 * Xử lý tất cả API calls liên quan đến authentication
 */
export class AuthService {
  private readonly endpoint = "/auth";

  /**
   * Đăng nhập
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(`${this.endpoint}/login`, credentials);
  }

  /**
   * Đăng xuất
   */
  async logout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`${this.endpoint}/logout`);
  }

  /**
   * Lấy thông tin user hiện tại
   */
  async getCurrentUser(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>(`${this.endpoint}/profile`);
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    return apiClient.post<RefreshTokenResponse>(`${this.endpoint}/refresh`);
  }

  /**
   * Thu hồi token
   */
  async revokeToken(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`${this.endpoint}/revoke`);
  }

  /**
   * Test endpoint
   */
  async test(): Promise<{ message: string }> {
    return apiClient.get<{ message: string }>(`${this.endpoint}/test`);
  }
}

// Export singleton instance
export const authService = new AuthService(); 