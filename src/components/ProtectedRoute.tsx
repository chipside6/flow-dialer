
import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);
  
  // Set a timeout to prevent getting stuck in the loading state
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setTimeoutReached(true);
        console.log('ProtectedRoute: Timeout reached while verifying authentication');
      }, 3000); // 3 second timeout
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // If authentication check is complete and user is authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }
  
  // If loading has completed or timeout reached, but user is not authenticated, redirect to login
  if (!isLoading || timeoutReached) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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
