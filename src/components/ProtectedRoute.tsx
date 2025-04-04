
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
  const [isChecking, setIsChecking] = useState(true);
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
          setIsChecking(false);
          navigate('/login', { 
            replace: true, 
            state: { from: window.location.pathname } 
          });
          return;
        }
        
        if (!data.session) {
          console.log("No session found, redirecting to login");
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
            setIsChecking(false);
            return;
          }
        }
        
        setIsChecking(false);
      } catch (error: any) {
        console.error("Auth check error:", error);
        
        // Handle timeout errors specifically
        if (error.name === 'AbortError') {
          setError("Authentication check timed out. Please try again.");
          toast({
            title: "Authentication Error",
            description: "Check timed out. Redirecting to login page.",
            variant: "destructive"
          });
        } else {
          setError(error.message || "Authentication check failed");
        }
        
        navigate('/login', { 
          replace: true, 
          state: { returnTo: window.location.pathname } 
        });
      }
    };
    
    checkAuth();
    
    // Add a fallback timeout to prevent getting stuck in checking state
    const fallbackTimeout = setTimeout(() => {
      if (isMounted && isChecking) {
        setIsChecking(false);
        setError("Authentication check took too long. Please try again.");
        navigate('/login', { replace: true });
      }
    }, 10000); // 10 second fallback
    
    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
    };
  }, [navigate, requireAdmin]);
  
  // If still checking, show a loader
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking authentication...</span>
      </div>
    );
  }
  
  // If there was an error and we're not redirecting, show error
  if (error && !isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <div className="bg-destructive/10 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-destructive mb-2">Authentication Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/login', { replace: true })}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  // If we get here, user is authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
