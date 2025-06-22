import { apiClient } from "@/lib/api-client";
import { User, LoginCredentials } from "@/stores/auth";

interface LoginResponse {
  access_token: string;
  user: User;
}

interface RefreshTokenResponse {
  access_token: string;
}

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

  /**
   * Đổi mật khẩu
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    return apiClient.post<void>(`${this.endpoint}/change-password`, data);
  }

  /**
   * Quên mật khẩu
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`${this.endpoint}/forgot-password`, { email });
  }

  /**
   * Reset mật khẩu
   */
  async resetPassword(data: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`${this.endpoint}/reset-password`, data);
  }

  /**
   * Verify token
   */
  async verifyToken(token: string): Promise<{ valid: boolean; user?: User }> {
    return apiClient.post<{ valid: boolean; user?: User }>(`${this.endpoint}/verify`, { token });
  }
}

// Export singleton instance
export const authService = new AuthService(); 