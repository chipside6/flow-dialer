
// Define types locally to avoid circular dependencies

// Base user interface
export interface User {
  id: string;
  email: string;
  created_at?: string;
  last_sign_in_at?: string;
}

// Session interface for authentication
export interface Session {
  user: User;
  token?: string;
  expires_at?: number;
}

// API URL config
export const API_URL = 'http://localhost:5000/api';

// User profile interface
export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string | null; // Update to allow null values
  email: string;
  company_name?: string;
  is_admin?: boolean;
}
