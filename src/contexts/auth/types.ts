
// Re-export the types with clear names to avoid circular dependency
export type User = {
  id: string;
  email: string;
  created_at?: string;
  last_sign_in_at?: string;
};

export type UserProfile = {
  id: string;
  full_name?: string;
  avatar_url?: string | null;
  email: string;
  company_name?: string;
  is_admin?: boolean;
  is_affiliate?: boolean;
};

export type Session = {
  user: User;
  token?: string;
  expires_at?: number;
};
