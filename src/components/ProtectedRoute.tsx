
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, sessionChecked, initialized, error, isAdmin, user } = useAuth();
  const location = useLocation();
  const [forceRender, setForceRender] = useState(false);
  
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
    forceRender
  });
  
  // Force render after shorter timeout to prevent infinite loading state
  useEffect(() => {
    // Use a shorter timeout (0.5 seconds) for better user experience
    const timeoutId = setTimeout(() => {
      if ((isLoading || !initialized) && !error) {
        console.log("Protected Route: Forcing render after timeout");
        setForceRender(true);
        
        // Use a more subtle toast with default variant
        toast({
          title: "Checking authentication...",
          description: "This is taking longer than expected",
          variant: "default" 
        });
      }
    }, 500); // Reduced to 0.5 seconds for faster feedback
    
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
          onClick={() => {
            // Clear any stale auth data before redirecting
            try {
              for (const key of Object.keys(localStorage)) {
                if (key.includes('supabase') || key.includes('auth') || key.includes('session') || key.includes('token')) {
                  localStorage.removeItem(key);
                }
              }
            } catch (e) {
              console.warn("Error clearing auth data:", e);
            }
            
            window.location.href = '/login';
          }} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md mt-4 hover:bg-primary/90 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }
  
  // If user is authenticated but route requires admin privileges and user is not admin
  if (isAuthenticated && requireAdmin === true && isAdmin !== true) {
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
