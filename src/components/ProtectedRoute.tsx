
import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Set authentication status
        setIsAuthenticated(!!session);
        
        // If admin access is required, check admin status
        if (requireAdmin && session) {
          const { data } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
            
          setIsAdmin(!!data?.is_admin);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
        
        // Update admin status if needed
        if (requireAdmin) {
          if (!session) {
            setIsAdmin(false);
          } else {
            // Check admin status in a separate call to avoid nested Supabase calls
            setTimeout(async () => {
              try {
                const { data } = await supabase
                  .from('profiles')
                  .select('is_admin')
                  .eq('id', session.user.id)
                  .single();
                  
                setIsAdmin(!!data?.is_admin);
              } catch (error) {
                console.error("Admin check error:", error);
                setIsAdmin(false);
              }
            }, 0);
          }
        }
      }
    );
    
    checkAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [requireAdmin]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Handle unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Handle admin required routes
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
