
import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { checkSubscriptionStatus } from '@/contexts/auth/authUtils';
import { isSessionValid } from '@/services/auth/session';
import { toast } from '@/components/ui/use-toast';

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
  const hasRedirectedRef = useRef(false);
  
  // Add a loading timeout to prevent infinite loading
  const [forceComplete, setForceComplete] = useState(false);
  
  // Force loading state to complete after a timeout
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Forcing auth check to complete after timeout");
        setForceComplete(true);
      }
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(loadingTimeout);
  }, [isLoading]);
  
  // Check subscription if required
  useEffect(() => {
    if (requireSubscription && isAuthenticated && user?.id && !checkingSubscription) {
      setCheckingSubscription(true);
      checkSubscriptionStatus(user.id)
        .then(hasActive => {
          setHasSubscription(hasActive);
          if (!hasActive && requireSubscription) {
            toast({
              title: "Subscription Required",
              description: "You need an active subscription to access this feature.",
              variant: "destructive"
            });
          }
        })
        .finally(() => {
          setCheckingSubscription(false);
        });
    }
  }, [requireSubscription, isAuthenticated, user, checkingSubscription]);
  
  // Show loading state while auth is being determined
  if ((isLoading && !forceComplete) || (!sessionChecked && !forceComplete) || (requireSubscription && checkingSubscription)) {
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
  if (!isAuthenticated && !hasRedirectedRef.current) {
    console.log('Not authenticated, redirecting to login');
    hasRedirectedRef.current = true;
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }
  
  // If admin required but user is not admin, redirect to unauthorized
  if (requireAdmin && !isAdmin && !hasRedirectedRef.current) {
    console.log('Admin required but user is not an admin, redirecting to unauthorized');
    hasRedirectedRef.current = true;
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  // If subscription required but user has no active subscription
  if (requireSubscription && !hasSubscription && !hasRedirectedRef.current) {
    hasRedirectedRef.current = true;
    return <Navigate to="/upgrade" state={{ from: location }} replace />;
  }
  
  // User is properly authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
