export interface User {
  account_id: number;
  username: string;
  role_id: number;
  role_name: string;
  is_active: boolean;
  is_locked: boolean;
  last_login?: Date;
  created_at?: Date;
  profile?: {
    manager_id?: number;
    employee_id?: number;
    customer_id?: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    position?: string; // Chỉ có với employee
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RefreshTokenResponse {
  access_token: string;
} 