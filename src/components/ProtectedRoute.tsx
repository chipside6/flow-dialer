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
  const [validatingSupabaseSession, setValidatingSupabaseSession] = useState(true);
  const [supabaseSessionValid, setSupabaseSessionValid] = useState<boolean | null>(null);
  const location = useLocation();
  const hasRedirectedRef = useRef(false);
  const touchIntervalRef = useRef<number | null>(null);
  
  // Debug logs to help identify issues
  useEffect(() => {
    console.log('ProtectedRoute Props:', { requireAdmin, requireSubscription });
    console.log('Auth State:', { isAuthenticated, isAdmin, isLoading, sessionChecked });
    console.log('Current Location:', location.pathname);
  }, [isAuthenticated, isAdmin, isLoading, sessionChecked, requireAdmin, requireSubscription, location.pathname]);
  
  // Directly verify session with Supabase API
  useEffect(() => {
    const verifySupabaseSession = async () => {
      try {
        console.log("ProtectedRoute: Verifying session with Supabase API");
        const { data, error } = await supabase.auth.getSession();
        
        const sessionIsValid = !error && !!data.session;
        setSupabaseSessionValid(sessionIsValid);
        
        console.log('Supabase session verification:', { 
          isValid: sessionIsValid, 
          hasSession: !!data.session,
          error: error ? true : false
        });
        
        // If there's a mismatch between auth context and actual Supabase session
        if (isAuthenticated && !sessionIsValid && !hasRedirectedRef.current) {
          console.warn("Session mismatch: Auth context says authenticated but Supabase disagrees");
          hasRedirectedRef.current = true;
          toast({
            title: "Session expired",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive"
          });
        }
        
      } catch (error) {
        console.error("Error verifying session with Supabase:", error);
        setSupabaseSessionValid(false);
      } finally {
        // Always complete validation
        setValidatingSupabaseSession(false);
      }
    };
    
    if (!isLoading && sessionChecked) {
      verifySupabaseSession();
    }
  }, [isAuthenticated, isLoading, sessionChecked, location.pathname]);
  
  // Touch session regularly to keep it alive if we have a valid session
  useEffect(() => {
    if (isAuthenticated && supabaseSessionValid) {
      // Initial touch
      touchSession();
      console.log('Initial session touch in ProtectedRoute');
      
      const touchInterval = setInterval(() => {
        touchSession();
        console.log('Session touched in ProtectedRoute interval');
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
  }, [isAuthenticated, supabaseSessionValid]);
  
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
  
  // Force loading state to complete after a timeout
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (validatingSupabaseSession) {
        console.log("Forcing validation state to complete after timeout");
        setValidatingSupabaseSession(false);
        // Set a default for supabaseSessionValid if it's still null
        if (supabaseSessionValid === null) {
          setSupabaseSessionValid(isAuthenticated); // Use auth context as fallback
        }
      }
    }, 3000);
    
    return () => clearTimeout(loadingTimeout);
  }, [validatingSupabaseSession, supabaseSessionValid, isAuthenticated]);
  
  // Combined auth state that uses both context and direct Supabase verification
  const isActuallyAuthenticated = isAuthenticated && 
    (supabaseSessionValid === true || (supabaseSessionValid === null && isSessionValid()));
  
  // Show loading state while auth is being determined
  if (isLoading || !sessionChecked || validatingSupabaseSession || (requireSubscription && checkingSubscription)) {
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
