
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    console.log('Protected Route - Initial Auth State:', {
      user: user ? 'Authenticated' : 'Not authenticated',
      isLoading,
      path: location.pathname
    });
    
    // Set a short timeout to ensure we don't get stuck in loading
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
      console.log('Protected Route - Forced auth check completion');
    }, 2000); // 2 second max timeout
    
    // If auth is already determined, clear timeout and set checking to false
    if (!isLoading) {
      clearTimeout(timer);
      setIsCheckingAuth(false);
      console.log('Protected Route - Auth check completed naturally');
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [isLoading, user, location.pathname]);

  // Show loading state only during the initial check
  if (isLoading && isCheckingAuth) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <span className="text-xl font-medium">Verifying authentication...</span>
      </div>
    );
  }

  // If no user after loading completes, redirect to login
  if (!user) {
    console.log('Protected Route - Redirecting to login - No user found');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  console.log('Protected Route - User authenticated, rendering content');
  return <>{children}</>;
};

export default ProtectedRoute;
