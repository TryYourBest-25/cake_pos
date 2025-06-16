/**
 * API Client Configuration
 * Cấu hình client API với environment variables và prefix
 */

// API Configuration từ environment variables
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://localhost:4653/api/v1",
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// API Response wrapper
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * API Client class với retry logic và error handling
 */
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
  }

  /**
   * Lấy headers mặc định với auth token
   */
  private getHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem("auth_token") 
      : null;
    
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Xử lý response từ API
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = await response.text() || errorMessage;
      }
      
      throw new ApiError(errorMessage, response.status, response);
    }

    try {
      return await response.json();
    } catch (error) {
      throw new ApiError("Phản hồi không hợp lệ từ server", response.status);
    }
  }

  /**
   * Retry logic cho network requests
   */
  private async fetchWithRetry(
    url: string, 
    options: RequestInit, 
    attempt: number = 1
  ): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        console.warn(`API request failed, retrying... (${attempt}/${this.retryAttempts})`);
        await this.delay(1000 * attempt); // Exponential backoff
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError("Yêu cầu bị timeout");
      }
      
      throw new NetworkError("Lỗi kết nối mạng");
    }
  }

  /**
   * Kiểm tra có nên retry không
   */
  private shouldRetry(error: any): boolean {
    return (
      error instanceof TypeError || // Network error
      (error instanceof ApiError && error.status >= 500) // Server error
    );
  }

  /**
   * Delay helper cho retry
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(this.baseURL + endpoint);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.fetchWithRetry(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = new URL(this.baseURL + endpoint);

    const response = await this.fetchWithRetry(url.toString(), {
      method: "POST",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const url = new URL(this.baseURL + endpoint);

    const response = await this.fetchWithRetry(url.toString(), {
      method: "PATCH",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const url = new URL(this.baseURL + endpoint);

    const response = await this.fetchWithRetry(url.toString(), {
      method: "PUT",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const url = new URL(this.baseURL + endpoint);

    const response = await this.fetchWithRetry(url.toString(), {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      return await this.get('/health');
    } catch (error) {
      console.error('API Health check failed:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin cấu hình API
   */
  getConfig() {
    return {
      baseURL: this.baseURL,
      timeout: this.timeout,
      retryAttempts: this.retryAttempts,
    };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type { ApiResponse };
export { API_CONFIG }; 