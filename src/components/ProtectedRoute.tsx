
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Simple auth check
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          console.log("No session found, redirecting to login");
          navigate('/login', { replace: true });
          return;
        }
        
        // Only check admin status if required
        if (requireAdmin) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.session.user.id)
            .maybeSingle();
          
          if (!profileData?.is_admin) {
            console.log("User is not admin, redirecting to unauthorized");
            navigate('/unauthorized', { replace: true });
            return;
          }
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate('/login', { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate, requireAdmin]);
  
  // If still checking, render nothing to avoid flicker
  if (isChecking) {
    return null;
  }
  
  // If we get here, user is authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
