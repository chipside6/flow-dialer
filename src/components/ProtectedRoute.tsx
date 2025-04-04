
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { clearAllAuthData } from '@/utils/sessionCleanup';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add a timeout to prevent infinite loading
        const authCheckTimeout = setTimeout(() => {
          console.warn("Auth check timed out, redirecting to login");
          clearAllAuthData();
          navigate('/login', { replace: true });
        }, 3000); // 3 second timeout
        
        // Simple session check
        const { data } = await supabase.auth.getSession();
        
        clearTimeout(authCheckTimeout);
        
        if (!data.session) {
          navigate('/login', { replace: true });
          return;
        }
        
        // Only do a basic admin check if required
        if (requireAdmin) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.session.user.id)
            .maybeSingle();
          
          if (error || !profileData?.is_admin) {
            navigate('/unauthorized', { replace: true });
            return;
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        clearAllAuthData();
        navigate('/login', { replace: true });
      }
    };
    
    checkAuth();
    
    // Add a backup timeout as a fallback
    const backupTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn("Protected route still loading after timeout, forcing state change");
        setIsLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(backupTimeout);
  }, [navigate, requireAdmin, isLoading]);
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
