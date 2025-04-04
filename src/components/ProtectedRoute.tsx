
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        // Set a timeout for the auth check
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        // Simple auth check
        const { data, error } = await supabase.auth.getSession();
        
        // Clear timeout since we got a response
        clearTimeout(timeoutId);
        
        if (!isMounted) return;
        
        if (error) {
          console.error("Auth check error:", error);
          setError(error.message);
          
          // Silently redirect to login
          navigate('/login', { 
            replace: true, 
            state: { from: window.location.pathname } 
          });
          return;
        }
        
        if (!data.session) {
          console.log("No session found, redirecting to login");
          
          // Silently redirect to login
          navigate('/login', { 
            replace: true, 
            state: { returnTo: window.location.pathname } 
          });
          return;
        }
        
        // Only check admin status if required
        if (requireAdmin) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', data.session.user.id)
              .maybeSingle();
            
            if (profileError) {
              throw profileError;
            }
            
            if (!profileData?.is_admin) {
              console.log("User is not admin, redirecting to unauthorized");
              navigate('/unauthorized', { replace: true });
              return;
            }
          } catch (profileError: any) {
            console.error("Admin check error:", profileError);
            setError(profileError.message);
            return;
          }
        }
        
        setIsAuthenticated(true);
      } catch (error: any) {
        console.error("Auth check error:", error);
        
        // Handle timeout errors specifically
        if (error.name === 'AbortError') {
          console.error("Authentication check timed out");
          setError("Authentication check timed out. Please try again.");
        } else {
          setError(error.message || "Authentication check failed");
        }
        
        // Silently redirect to login on error
        navigate('/login', { 
          replace: true, 
          state: { returnTo: window.location.pathname } 
        });
      }
    };
    
    checkAuth();
    
    // Add a fallback timeout to prevent getting stuck
    const fallbackTimeout = setTimeout(() => {
      if (isMounted && isAuthenticated === null) {
        setError("Authentication check took too long. Please try again.");
        navigate('/login', { replace: true });
      }
    }, 8000); // 8 second fallback
    
    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
    };
  }, [navigate, requireAdmin]);
  
  // If there was an error and we're not redirecting, show error
  if (error && isAuthenticated === null) {
    console.error("Authentication error:", error);
    return null; // Return null to avoid showing loading state
  }
  
  // Show children only when authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }
  
  // For all other states, render nothing (or a minimal placeholder if needed)
  return null;
};

export default ProtectedRoute;
