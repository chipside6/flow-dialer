
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading, sessionChecked, initialized, error, isAdmin } = useAuth();
  const location = useLocation();
  const [forceRender, setForceRender] = useState(false);
  const [manualAdminCheck, setManualAdminCheck] = useState<boolean | null>(null);
  const [isManualChecking, setIsManualChecking] = useState(false);
  
  // Perform direct admin check as backup
  useEffect(() => {
    const checkAdminDirectly = async () => {
      if (!requireAdmin || !user || manualAdminCheck !== null) return;
      
      if (isAdmin === false) {
        setIsManualChecking(true);
        try {
          console.log("ProtectedRoute - Performing direct admin check for user:", user.id);
          const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error("ProtectedRoute - Direct admin check error:", error);
            setManualAdminCheck(false);
            return;
          }
          
          const isUserAdmin = !!data?.is_admin;
          console.log("ProtectedRoute - Direct admin check result:", isUserAdmin);
          setManualAdminCheck(isUserAdmin);
        } catch (err) {
          console.error("ProtectedRoute - Error in direct admin check:", err);
          setManualAdminCheck(false);
        } finally {
          setIsManualChecking(false);
        }
      }
    };
    
    if (initialized && isAuthenticated && requireAdmin) {
      checkAdminDirectly();
    }
  }, [user, requireAdmin, isAdmin, isAuthenticated, initialized, manualAdminCheck]);
  
  console.log("Protected Route State:", { 
    isAuthenticated, 
    isLoading, 
    sessionChecked, 
    initialized, 
    error,
    isAdmin,
    requireAdmin,
    path: location.pathname,
    forceRender,
    manualAdminCheck,
    isManualChecking
  });
  
  // Force render after timeout to prevent infinite loading state
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if ((isLoading || !initialized) && !error) {
        console.log("Protected Route: Forcing render after timeout");
        setForceRender(true);
      }
    }, 3000); // 3 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, initialized, error]);
  
  // If we're still initializing and haven't completed auth check, but force render triggered
  if ((isLoading || !initialized) && !error && !forceRender) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <span className="text-xl font-medium">Verifying authentication...</span>
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
          onClick={() => window.location.href = '/login'} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md mt-4 hover:bg-primary/90 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }
  
  // If manual admin check passed, allow access
  if (requireAdmin && manualAdminCheck === true) {
    return <>{children}</>;
  }
  
  // If user is authenticated but route requires admin privileges
  if (isAuthenticated && requireAdmin && isAdmin === false && manualAdminCheck !== true) {
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
      <span className="text-xl font-medium">Checking authentication status...</span>
    </div>
  );
};

export default ProtectedRoute;
