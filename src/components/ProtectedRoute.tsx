
import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, initialized, isAdmin } = useAuth();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [authError, setAuthError] = useState(false);
  
  // Set a timeout to prevent getting stuck in the loading state
  useEffect(() => {
    if (isLoading && !initialized) {
      const timer = setTimeout(() => {
        setTimeoutReached(true);
        console.log('ProtectedRoute: Timeout reached while verifying authentication');
      }, 3000); // 3 second timeout
      
      return () => clearTimeout(timer);
    }
    
    // If auth has been initialized but we're not authenticated, check for errors
    if (initialized && !isAuthenticated && !isLoading) {
      const errorTimer = setTimeout(() => {
        setAuthError(true);
      }, 500);
      
      return () => clearTimeout(errorTimer);
    }
  }, [isLoading, initialized, isAuthenticated]);

  // If authentication check is complete and user is authenticated, check admin status if needed
  if (isAuthenticated) {
    // If adminOnly is true and user is not an admin, redirect to dashboard
    if (adminOnly && !isAdmin) {
      return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }
    
    // User is authenticated (and is admin if adminOnly is true)
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
