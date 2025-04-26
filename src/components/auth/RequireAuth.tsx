
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';
import { touchSession } from '@/services/auth/session';
import { supabase } from '@/integrations/supabase/client';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated, isLoading, sessionChecked, user } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);

  // Verify the current session with Supabase directly
  useEffect(() => {
    const verifySession = async () => {
      try {
        console.log("RequireAuth: Verifying session directly with Supabase");
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          console.warn("RequireAuth: No valid session found from Supabase");
          setSessionValid(false);
        } else {
          console.log("RequireAuth: Valid session confirmed with Supabase");
          setSessionValid(true);
          // Touch the session to extend its lifetime
          touchSession();
        }
      } catch (err) {
        console.error("RequireAuth: Error verifying session:", err);
        setSessionValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    if (!isLoading) {
      verifySession();
    }
  }, [isLoading]);

  // Touch the session more frequently to prevent session expiration
  useEffect(() => {
    // Only setup touch interval if we have a valid session
    if (sessionValid) {
      console.log("RequireAuth: Setting up session touch interval");
      // Initial touch
      touchSession();
      
      // Set up a regular interval to touch the session
      const intervalId = setInterval(() => {
        touchSession();
      }, 30000); // Touch every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [sessionValid]);

  // Show loading while verifying
  if (isLoading || (isVerifying && sessionValid === null)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not authenticated or session verification failed
  if (!isAuthenticated || sessionValid === false) {
    console.log("RequireAuth: Redirecting to login, auth status:", { isAuthenticated, sessionValid });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated and session is valid
  console.log("RequireAuth: Authentication confirmed, rendering children");
  return <>{children}</>;
};
