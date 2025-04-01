
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  initialized: boolean;
  signOut: () => Promise<{ success: boolean, error: any | null }>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  initialized: false,
  signOut: async () => ({ success: false, error: null }),
});

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ? { id: session.user.id, email: session.user.email || '' } : null);
        
        // Check admin status if authenticated
        if (session?.user) {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', session.user.id)
              .single();
              
            setIsAdmin(!!data?.is_admin);
          } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
        setInitialized(true);
      }
    );
    
    // Check current session on load
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        setUser(session?.user ? { id: session.user.id, email: session.user.email || '' } : null);
        
        // Check admin status if authenticated
        if (session?.user) {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', session.user.id)
              .single();
              
            setIsAdmin(!!data?.is_admin);
          } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
        setInitialized(true);
      }
    };
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      return { success: true, error: null };
    } catch (error) {
      console.error("Sign out error:", error);
      return { success: false, error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin,
      isLoading,
      initialized,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
