
// Auth service types

export interface User {
  id: string;
  email: string;
  created_at?: string;
  last_sign_in_at?: string;
}

export interface UserProfile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  is_admin?: boolean;
  is_affiliate?: boolean;
  email?: string;
  company_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Session {
  user: User;
  expires_at: number;
  token?: string;
}

// Define API URL - this will be used across all services
export const API_URL = 'http://localhost:5000/api';
