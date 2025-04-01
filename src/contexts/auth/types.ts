
export interface User {
  id: string;
  email: string;
  created_at?: string;
  last_sign_in_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string | null;
  company_name?: string;
  is_admin?: boolean;
}
