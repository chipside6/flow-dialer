
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';
import { isAuthDataStale, refreshAuthDataIfStale } from '@/utils/sessionCleanup';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, isAdmin, initialized } = useAuth();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Effect to handle authentication check with retry logic
  useEffect(() => {
    if (!initialized) return;
    
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      
      // First check - basic authentication status from context
      if (!isAuthenticated) {
        console.log('User is not authenticated, redirecting to login');
        navigate(fallbackPath, { replace: true });
        setIsCheckingAuth(false);
        setAuthChecked(true);
        return;
      }
      
      // Second check - if we need admin privileges
      if (requireAdmin && !isAdmin) {
        console.log('Admin privileges required but user is not admin');
        // If user is authenticated but not admin, redirect to unauthorized page
        navigate('/unauthorized', { 
          replace: true,
          state: { from: { pathname: window.location.pathname } }
        });
        setIsCheckingAuth(false);
        setAuthChecked(true);
        return;
      }
      
      // Third check - if auth data is stale, refresh it
      if (isAuthDataStale()) {
        console.log('Auth data is stale, refreshing...');
        try {
          // Try to refresh auth data from server
          const refreshed = await refreshAuthDataIfStale();
          
          if (!refreshed && requireAdmin) {
            // If refresh failed and we need admin privileges
            navigate('/unauthorized', { 
              replace: true,
              state: { from: { pathname: window.location.pathname } }
            });
            setIsCheckingAuth(false);
            setAuthChecked(true);
            return;
          }
        } catch (error) {
          console.error('Error refreshing auth data:', error);
          // Continue anyway - we'll use what we have
        }
      }
      
      // Auth checks passed
      setIsCheckingAuth(false);
      setAuthChecked(true);
    };
    
    checkAuth();
  }, [isAuthenticated, isAdmin, initialized, navigate, fallbackPath, requireAdmin]);
  
  // If still initializing auth state, show loading
  if (!initialized || isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-lg text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }
  
  // If checks have completed and we're still here, render children
  return authChecked ? <>{children}</> : null;
};

export default ProtectedRoute;
