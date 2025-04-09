
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';
import { touchSession } from '@/services/auth/session';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading, sessionChecked } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  // Touch the session on component mount to prevent premature session expiration
  React.useEffect(() => {
    touchSession();
  }, []);

  // Check if we're still loading the auth state
  React.useEffect(() => {
    // If we have determined the session status, we're no longer checking
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
