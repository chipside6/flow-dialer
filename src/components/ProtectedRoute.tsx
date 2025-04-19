
import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { checkSubscriptionStatus } from '@/contexts/auth/authUtils';
import { touchSession, isSessionValid } from '@/services/auth/session';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [validatingSession, setValidatingSession] = useState(true);
  const location = useLocation();
  const hasRedirectedRef = useRef(false);
  const touchIntervalRef = useRef<number | null>(null);
  
  // Verify the session is still valid with Supabase directly
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        const sessionIsValid = !error && !!data.session;
        
        // If there's a mismatch between auth context and actual session, reload the page
        if (isAuthenticated && !sessionIsValid && !hasRedirectedRef.current) {
          console.warn("Session mismatch detected, redirecting to login");
          hasRedirectedRef.current = true;
          return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
        }
        
      } catch (error) {
        console.error("Error verifying session:", error);
      } finally {
        setValidatingSession(false);
      }
    };
    
    if (!isLoading) {
      verifySession();
    }
  }, [isAuthenticated, isLoading, location.pathname]);
  
  // Double-check session validity as a safety measure
  const sessionIsValid = isSessionValid();
  const isActuallyAuthenticated = isAuthenticated && sessionIsValid;
  
  // Touch session every 30 seconds to ensure it stays alive
  useEffect(() => {
    if (isActuallyAuthenticated) {
      // Initial touch
      touchSession();
      
      const touchInterval = setInterval(() => {
        touchSession();
        console.log('Session touched in ProtectedRoute component');
      }, 30000); // Every 30 seconds
      
      // Store the interval ID in the ref
      touchIntervalRef.current = touchInterval as unknown as number;
      
      return () => {
        if (touchIntervalRef.current) {
          clearInterval(touchIntervalRef.current);
          touchIntervalRef.current = null;
        }
      };
    }
  }, [isActuallyAuthenticated]);
  
  // Check subscription if required
  useEffect(() => {
    if (requireSubscription && isActuallyAuthenticated && user?.id && !checkingSubscription) {
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
  }, [requireSubscription, isActuallyAuthenticated, user, checkingSubscription]);
  
  // Show loading state while auth is being determined
  if ((isLoading || !sessionChecked || validatingSession) || (requireSubscription && checkingSubscription)) {
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
  if (!isActuallyAuthenticated && !hasRedirectedRef.current) {
    console.log('Not authenticated, redirecting to login');
    hasRedirectedRef.current = true;
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }
  
  // If admin required but user is not admin, redirect to unauthorized
  if (requireAdmin && !isAdmin && !hasRedirectedRef.current) {
    hasRedirectedRef.current = true;
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  // If subscription required but user has no active subscription
  if (requireSubscription && !hasSubscription && !hasRedirectedRef.current) {
    hasRedirectedRef.current = true;
    return <Navigate to="/upgrade" state={{ from: location }} replace />;
  }
  
  // User is authenticated (and admin if required and has subscription if required), render children
  return <>{children}</>;
};

export default ProtectedRoute;
