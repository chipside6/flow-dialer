
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth';
import { clearAllAuthData } from '@/utils/sessionCleanup';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, sessionChecked, initialized, error, isAdmin, user } = useAuth();
  const location = useLocation();
  const [forceRender, setForceRender] = useState(false);
  const adminStatusCheckedRef = useRef(false);
  
  // On component mount, check if there's a stored admin status
  useEffect(() => {
    if (user?.id && !adminStatusCheckedRef.current) {
      // Update localStorage with current admin status if we have it from the server
      if (typeof isAdmin === 'boolean') {
        localStorage.setItem('isUserAdmin', isAdmin ? 'true' : 'false');
        localStorage.setItem('adminLastUpdated', Date.now().toString());
        adminStatusCheckedRef.current = true;
      }
      
      // If we don't have admin status yet, we'll use cached value temporarily
      else if (localStorage.getItem('isUserAdmin') === 'true') {
        // If cached admin status is older than 24 hours, consider it stale
        const lastUpdated = parseInt(localStorage.getItem('adminLastUpdated') || '0');
        const isStale = Date.now() - lastUpdated > 24 * 60 * 60 * 1000;
        
        if (!isStale) {
          console.log("Using cached admin status until server data arrives");
        }
      }
    }
  }, [user, isAdmin]);
  
  console.log("Protected Route State:", { 
    isAuthenticated, 
    isLoading, 
    sessionChecked, 
    initialized, 
    error,
    isAdmin,
    requireAdmin,
    userId: user?.id,
    path: location.pathname,
    forceRender,
    storedAdminStatus: localStorage.getItem('isUserAdmin') === 'true'
  });
  
  // Force render after timeout to prevent infinite loading state
  useEffect(() => {
    // Short timeout to handle loading state
    const timeoutId = setTimeout(() => {
      if ((isLoading || !initialized) && !error) {
        console.log("Protected Route: Forcing render after timeout");
        setForceRender(true);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, initialized, error]);
  
  // If we're still initializing and haven't completed auth check, but force render triggered
  if ((isLoading || !initialized) && !error && !forceRender) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <span className="text-xl font-medium">Loading...</span>
      </div>
    );
  }
  
  // If we've detected an auth error
  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md mb-4">
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            {error.message || "There was a problem verifying your authentication status. Please try logging in again."}
          </AlertDescription>
        </Alert>
        <button 
          onClick={() => {
            // Clear any stale auth data before redirecting
            clearAllAuthData();
            window.location.href = '/login';
          }} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md mt-4 hover:bg-primary/90 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }
  
  // Check localStorage for admin status as a fallback for better persistence
  const storedAdminStatus = localStorage.getItem('isUserAdmin') === 'true';
  const effectiveAdminStatus = isAdmin || (requireAdmin && storedAdminStatus);
  
  // If user is authenticated but route requires admin privileges and user is not admin
  if (isAuthenticated && requireAdmin === true && !effectiveAdminStatus) {
    console.log("User is authenticated but lacks admin privileges, redirecting to unauthorized");
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  // If user is authenticated or we force render after timeout, render children
  if (isAuthenticated || (forceRender && initialized)) {
    return <>{children}</>;
  }
  
  // If initialization is complete and user is not authenticated, redirect to login
  if ((initialized || forceRender) && !isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Fallback loading state (should rarely reach here)
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <span className="text-xl font-medium">Loading...</span>
    </div>
  );
};

export default ProtectedRoute;
