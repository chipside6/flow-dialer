
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading, sessionChecked } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [authChecked, setAuthChecked] = React.useState(false);

  // Check if we're still loading the auth state
  React.useEffect(() => {
    // If we have a user or explicitly know auth status, we're no longer loading
    if (sessionChecked) {
      setIsCheckingAuth(false);
      setAuthChecked(true);
    }
  }, [user, isAuthenticated, sessionChecked]);

  // Add debouncing to prevent flashing redirect during page transitions
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && authChecked) {
      // Small timeout to prevent premature redirect during navigation
      const timeoutId = setTimeout(() => {
        // Only redirect if still not authenticated after timeout
        if (!isAuthenticated) {
          setAuthChecked(true);
        }
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, isAuthenticated, authChecked]);

  if (isCheckingAuth || isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated && authChecked) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the children
  return <>{children}</>;
};
