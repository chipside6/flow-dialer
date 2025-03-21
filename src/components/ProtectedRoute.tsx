
import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, initialized } = useAuth();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [authError, setAuthError] = useState(false);
  
  // Set a timeout to prevent getting stuck in the loading state
  useEffect(() => {
    if (isLoading && !initialized) {
      const timer = setTimeout(() => {
        setTimeoutReached(true);
        console.log('ProtectedRoute: Timeout reached while verifying authentication');
      }, 2000); // Reduced from 3s to 2s for faster fallback
      
      return () => clearTimeout(timer);
    }
    
    // If auth has been initialized but we're not authenticated, check for errors
    if (initialized && !isAuthenticated && !isLoading) {
      const errorTimer = setTimeout(() => {
        setAuthError(true);
      }, 300); // Reduced from 500ms to 300ms
      
      return () => clearTimeout(errorTimer);
    }
  }, [isLoading, initialized, isAuthenticated]);

  // Force redirect after a longer timeout if still loading
  useEffect(() => {
    const forceRedirectTimer = setTimeout(() => {
      if (isLoading) {
        console.log('ProtectedRoute: Force redirecting to login due to prolonged loading');
        setTimeoutReached(true);
      }
    }, 5000); // 5 second absolute timeout
    
    return () => clearTimeout(forceRedirectTimer);
  }, [isLoading]);

  // If authentication check is complete and user is authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }
  
  // If auth has been initialized or timeout reached, but user is not authenticated, redirect to login
  if ((initialized && !isLoading) || timeoutReached) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If we've detected an auth error after initialization
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
  
  // Show loading state while authentication is being checked (before timeout)
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <span className="text-xl font-medium">Verifying authentication...</span>
    </div>
  );
};

export default ProtectedRoute;
