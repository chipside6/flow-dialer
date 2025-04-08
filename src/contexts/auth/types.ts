
// Define types locally to avoid circular dependencies

// Base user interface
export interface User {
  id: string;
  email: string;
  created_at?: string;
  last_sign_in_at?: string;
}

// User profile interface
export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string | null;
  email?: string;
  company_name?: string;
  is_admin?: boolean;
}
