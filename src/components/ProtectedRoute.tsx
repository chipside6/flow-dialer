
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
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
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
            navigate('/unauthorized', { replace: true });
            return;
          }
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate('/login', { 
          replace: true, 
          state: { returnTo: window.location.pathname } 
        });
      }
    };
    
    checkAuth();
  }, [navigate, requireAdmin]);
  
  // Show loading state briefly to prevent flashing
  if (isAuthenticated === null) {
    return null; // Return null while checking - no loader shown to user
  }
  
  // Render children when authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
