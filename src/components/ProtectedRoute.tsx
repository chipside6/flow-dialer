
import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [authError, setAuthError] = useState(false);
  const location = useLocation();
  
  // Check user authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth check error:", error);
          setIsAuthenticated(false);
          setAuthError(true);
        } else {
          setIsAuthenticated(!!data.session);
        }
      } catch (err) {
        console.error("Failed to check authentication:", err);
        setIsAuthenticated(false);
        setAuthError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
        setIsLoading(false);
      }
    );
    
    // Set a timeout to prevent getting stuck in the loading state
    const timer = setTimeout(() => {
      if (isLoading) {
        setTimeoutReached(true);
        setIsLoading(false);
        console.log('ProtectedRoute: Timeout reached while verifying authentication');
      }
    }, 1500);
    
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // If we're still loading and haven't reached timeout, show loading indicator
  if (isLoading && !timeoutReached) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <span className="text-xl font-medium">Verifying authentication...</span>
      </div>
    );
  }
  
  // If we've detected an auth error
  if (authError) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md mb-4">
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            There was a problem verifying your authentication status. Please try logging in again.
          </AlertDescription>
        </Alert>
        <button 
          onClick={() => window.location.href = '/login'} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md mt-4 hover:bg-primary/90 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }
  
  // If user is authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }
  
  // If user is not authenticated, redirect to login
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
