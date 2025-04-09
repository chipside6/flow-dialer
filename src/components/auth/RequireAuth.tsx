
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';
import { touchSession } from '@/services/auth/session';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated, isLoading, sessionChecked } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  // Touch the session more frequently to prevent session expiration
  React.useEffect(() => {
    // Initial touch
    touchSession();
    
    // Set up a regular interval to touch the session
    const intervalId = setInterval(() => {
      touchSession();
    }, 60000); // Touch every minute
    
    return () => clearInterval(intervalId);
  }, []);

  // Update checking state when session check is complete
  React.useEffect(() => {
    if (sessionChecked) {
      setIsCheckingAuth(false);
    }
  }, [sessionChecked]);

  if (isCheckingAuth || isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the children
  return <>{children}</>;
};
