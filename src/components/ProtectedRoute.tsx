
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { clearAllAuthData } from '@/utils/sessionCleanup';
import { useToast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        // Add a timeout to prevent infinite loading
        const authCheckTimeout = setTimeout(() => {
          if (isMounted) {
            console.warn("Auth check timed out, redirecting to login");
            clearAllAuthData();
            navigate('/login', { replace: true });
          }
        }, 5000); // 5 second timeout
        
        // Simple session check
        const { data, error } = await supabase.auth.getSession();
        
        clearTimeout(authCheckTimeout);
        
        if (error) {
          console.error("Auth session error:", error);
          
          // Network errors shouldn't immediately log out the user
          if (error.message.includes('network') || error.message.includes('abort')) {
            if (retryCount < maxRetries) {
              setRetryCount(prev => prev + 1);
              setIsLoading(false); // Allow rendering content during retry
              return;
            }
          }
          
          // Only show toast for non-network errors
          if (!error.message.includes('network') && !error.message.includes('abort')) {
            toast({
              title: "Authentication error",
              description: "Your session has expired. Please log in again.",
              variant: "destructive",
            });
          }
          
          clearAllAuthData();
          navigate('/login', { replace: true });
          return;
        }
        
        if (!data.session) {
          // Don't show a toast, just redirect silently
          navigate('/login', { replace: true });
          return;
        }
        
        // Only do a basic admin check if required
        if (requireAdmin) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', data.session.user.id)
              .maybeSingle();
            
            if (profileError) {
              console.error("Error fetching admin status:", profileError);
              // Don't redirect, just continue
            } else if (!profileData?.is_admin) {
              navigate('/unauthorized', { replace: true });
              return;
            }
          } catch (adminCheckError) {
            console.error("Admin check error:", adminCheckError);
            // Continue showing the page even if admin check fails
          }
        }
        
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        
        // Only attempt retries for network errors
        if (error instanceof Error && 
            (error.message.includes('network') || error.message.includes('abort'))) {
          if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            setIsLoading(false); // Allow rendering content during retry
            return;
          }
        }
        
        if (isMounted) {
          clearAllAuthData();
          navigate('/login', { replace: true });
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [navigate, requireAdmin, retryCount, toast]);
  
  // Always show children - no loading state
  // This prevents UI flickering during authentication checks
  return <>{children}</>;
};

export default ProtectedRoute;
