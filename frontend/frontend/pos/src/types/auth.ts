export interface User {
  id: number;
  username: string;
  role: {
    role_id: number;
    name: string;
    description?: string;
  };
  manager?: {
    manager_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
  };
  employee?: {
    employee_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
  };
  customer?: {
    customer_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
  }[];
  is_active?: boolean;
  is_locked: boolean;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
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