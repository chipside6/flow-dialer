
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const navigate = useNavigate();
  
  // Simple one-time auth check without state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          navigate('/login', { replace: true });
          return;
        }
        
        // Only do admin check if required
        if (requireAdmin) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.session.user.id)
            .maybeSingle();
          
          if (!profileData?.is_admin) {
            navigate('/unauthorized', { replace: true });
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };
    
    checkAuth();
  }, [navigate, requireAdmin]);
  
  // Always render children immediately
  return <>{children}</>;
};

export default ProtectedRoute;
