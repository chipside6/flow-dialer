
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const navigate = useNavigate();
  
  // Simple auth check without loading state or background checking
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate('/login', { replace: true });
        return;
      }
      
      // Only do a basic admin check if required
      if (requireAdmin) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.session.user.id)
            .maybeSingle();
          
          if (!profileData?.is_admin) {
            navigate('/unauthorized', { replace: true });
          }
        } catch (error) {
          console.error("Admin check error:", error);
        }
      }
    };
    
    checkAuth();
  }, [navigate, requireAdmin]);
  
  // Always render children - no loading state
  return <>{children}</>;
};

export default ProtectedRoute;
