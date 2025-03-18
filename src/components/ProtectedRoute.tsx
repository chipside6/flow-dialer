
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);
  
  useEffect(() => {
    console.log('Protected Route - Auth State:', {
      user: user ? 'Authenticated' : 'Not authenticated',
      isLoading,
      path: location.pathname,
      timeoutReached
    });
    
    // Set a timeout to prevent getting stuck in loading state
    const timer = setTimeout(() => {
      setTimeoutReached(true);
      console.log('Protected Route - Timeout reached, forcing render decision');
    }, 1000); // 1s timeout
    
    return () => clearTimeout(timer);
  }, [user, isLoading, location.pathname, timeoutReached]);

  // If we have the user, render immediately
  if (user) {
    console.log('Protected Route - User authenticated, rendering content');
    return <>{children}</>;
  }
  
  // If loading is complete or timeout reached, but no user, redirect to login
  if (!isLoading || timeoutReached) {
    console.log('Protected Route - No user after loading/timeout, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only show loading state briefly
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <span className="text-xl font-medium">Verifying authentication...</span>
    </div>
  );
};

export default ProtectedRoute;
