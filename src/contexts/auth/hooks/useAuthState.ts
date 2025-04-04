
import { useState } from 'react';
import { User } from '@supabase/supabase-js';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  return {
    user,
    setUser,
    loading,
    setIsLoading,
    initialized,
    setInitialized
  };
};
