
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Simple auth check
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          // Silently redirect to login
          navigate('/login', { 
            replace: true, 
            state: { returnTo: window.location.pathname } 
          });
          return;
        }
        
        // Only check admin status if required
        if (requireAdmin) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.session.user.id)
            .maybeSingle();
          
          if (profileError || !profileData?.is_admin) {
            // Redirect non-admins to unauthorized page
            navigate('/unauthorized', { replace: true });
            return;
          }
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check error:", error);
        
        // Silently redirect to login on error
        navigate('/login', { 
          replace: true, 
          state: { returnTo: window.location.pathname } 
        });
      }
    };
    
    checkAuth();
  }, [navigate, requireAdmin]);
  
  // Show children only when authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }
  
  // Return null while checking authentication
  return null;
};

export default ProtectedRoute;
