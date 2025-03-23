
import { User, Session } from '@/contexts/auth/types';

// Update API URL to match the backend port (5000 instead of 3001)
export const API_URL = 'http://localhost:5000/api';

export type { User, Session };

export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  email: string;
  company_name?: string;
  is_admin?: boolean;
  is_affiliate?: boolean;
}
