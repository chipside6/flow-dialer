
import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { touchSession, isSessionValid } from '@/services/auth/session';
import { useSubscription } from '@/hooks/subscription';

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
  const { 
    hasLifetimePlan, 
    isLoading: subscriptionLoading, 
    fetchCurrentSubscription 
  } = useSubscription();
  const location = useLocation();
  const [hasFetchedSubscription, setHasFetchedSubscription] = useState(false);
  const redirectingRef = useRef(false);
  
  // Double-check session validity as a safety measure
  const sessionIsValid = isSessionValid();
  const isActuallyAuthenticated = isAuthenticated && sessionIsValid;
  
  // Fetch subscription data only once when needed
  useEffect(() => {
    if (requireSubscription && isActuallyAuthenticated && user?.id && !hasFetchedSubscription) {
      fetchCurrentSubscription()
        .then(() => setHasFetchedSubscription(true))
        .catch(err => {
          console.error("Failed to fetch subscription:", err);
          setHasFetchedSubscription(true); // Mark as fetched even on error to prevent retries
        });
    }
  }, [requireSubscription, isActuallyAuthenticated, user, fetchCurrentSubscription, hasFetchedSubscription]);

  // Touch session every 30 seconds to ensure it stays alive
  useEffect(() => {
    if (isActuallyAuthenticated) {
      // Initial touch
      touchSession();
      
      const touchInterval = setInterval(() => {
        touchSession();
        console.log('Session touched in ProtectedRoute component');
      }, 30000); // Every 30 seconds
      
      return () => clearInterval(touchInterval);
    }
  }, [isActuallyAuthenticated]);
  
  // Show loading state while auth is being determined
  if ((isLoading || !sessionChecked) || (requireSubscription && subscriptionLoading && !hasFetchedSubscription)) {
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
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }
  
  // If admin required but user is not admin, redirect to unauthorized
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  // If subscription required but user has no active subscription
  if (requireSubscription && !hasLifetimePlan && !redirectingRef.current) {
    console.log('No lifetime plan, redirecting to upgrade page');
    redirectingRef.current = true; // Prevent multiple redirects
    return <Navigate to="/upgrade" state={{ from: location }} replace />;
  }
  
  // User is authenticated (and admin if required and has subscription if required), render children
  return <>{children}</>;
};

export default ProtectedRoute;
