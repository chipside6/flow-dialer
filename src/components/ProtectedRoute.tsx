
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
        // Simple session check
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          navigate('/login', { replace: true });
          return;
        }
        
        // Only do a basic admin check if required
        if (requireAdmin) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.session.user.id)
            .single();
          
          if (!profileData?.is_admin) {
            navigate('/unauthorized', { replace: true });
            return;
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate('/login', { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate, requireAdmin]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
