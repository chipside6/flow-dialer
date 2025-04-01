
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  created_at?: string;
  last_sign_in_at?: string;
}

interface UserProfile {
  id: string;
  full_name?: string;
  email: string;
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  initialized: boolean;
  sessionChecked: boolean;
  setProfile: (profile: UserProfile | null) => void;
  signOut: () => Promise<{ success: boolean, error: any | null }>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  initialized: false,
  sessionChecked: false,
  setProfile: () => {},
  signOut: async () => ({ success: false, error: null }),
});

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at
          };
          setUser(userData);
          
          // Check admin status if authenticated
          try {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (data) {
              const profileData: UserProfile = {
                id: data.id,
                full_name: data.full_name,
                email: session.user.email || '',
                is_admin: !!data.is_admin
              };
              setProfile(profileData);
              setIsAdmin(!!data.is_admin);
            } else {
              setProfile(null);
              setIsAdmin(false);
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
            setProfile(null);
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
        
        setIsLoading(false);
        setSessionChecked(true);
        setInitialized(true);
      }
    );
    
    // Check current session on load
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at
          };
          setUser(userData);
          
          // Check admin status if authenticated
          try {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (data) {
              const profileData: UserProfile = {
                id: data.id,
                full_name: data.full_name,
                email: session.user.email || '',
                is_admin: !!data.is_admin
              };
              setProfile(profileData);
              setIsAdmin(!!data.is_admin);
            } else {
              setProfile(null);
              setIsAdmin(false);
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
            setProfile(null);
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
        setSessionChecked(true);
        setInitialized(true);
      }
    };
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateProfile = (newProfile: UserProfile | null) => {
    setProfile(newProfile);
  };

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
      profile,
      isAuthenticated: !!user,
      isAdmin,
      isLoading,
      initialized,
      sessionChecked,
      setProfile: updateProfile,
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
