import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { checkSubscriptionStatus } from '@/contexts/auth/authUtils';
import { isSessionValid, touchSession } from '@/services/auth/session';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSubscription?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireSubscription = false
}) => {
  const { isAuthenticated, isAdmin, isLoading, user, sessionChecked } = useAuth();
  const [hasSubscription, setHasSubscription] = useState(true);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const location = useLocation();
  
  // Double-check session validity as a safety measure
  const sessionIsValid = isSessionValid();
  const isActuallyAuthenticated = isAuthenticated && sessionIsValid;
  
  // Touch the session periodically to keep it active
  useEffect(() => {
    // Initial touch
    touchSession();
    
    // Set up interval to touch session periodically
    const intervalId = setInterval(() => {
      touchSession();
    }, 60000); // Touch every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Check subscription if required
  useEffect(() => {
    if (requireSubscription && isActuallyAuthenticated && user?.id) {
      setCheckingSubscription(true);
      checkSubscriptionStatus(user.id)
        .then(hasActive => {
          setHasSubscription(hasActive);
        })
        .finally(() => {
          setCheckingSubscription(false);
        });
    }
  }, [requireSubscription, isActuallyAuthenticated, user]);
  
  // Show loading state while auth is being determined
  if ((isLoading || !sessionChecked) || (requireSubscription && checkingSubscription)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="w-full max-w-md space-y-4 p-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isActuallyAuthenticated) {
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }
  
  // If admin required but user is not admin, redirect to unauthorized
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  // If subscription required but user has no active subscription
  if (requireSubscription && !hasSubscription) {
    return <Navigate to="/upgrade" state={{ from: location }} replace />;
  }
  
  // User is authenticated (and admin if required and has subscription if required), render children
  return <>{children}</>;
};

export default ProtectedRoute;
