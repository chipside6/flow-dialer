
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  
  // Simplified auth check
  useEffect(() => {
    const checkAuth = async () => {
      if (checking) return;
      setChecking(true);
      
      try {
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
      } catch (error) {
        console.error("Authentication check error:", error);
      }
    };
    
    checkAuth();
  }, [navigate, requireAdmin, checking]);
  
  // Always render children - no loading state
  return <>{children}</>;
};

export default ProtectedRoute;
