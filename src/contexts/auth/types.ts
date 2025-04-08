
export interface User {
  id: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}
