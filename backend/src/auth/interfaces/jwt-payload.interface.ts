export interface JwtPayload {
  sub: number; // account_id
  username: string;
  role_id: number;
  role_name: string;
  iat?: number;
  exp?: number;
} 