
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    // Wait for auth state to settle
    if (!isLoading) {
      setIsCheckingAuth(false);
    }
    
    // Add debug logs
    console.log('Protected Route - Auth State:', {
      user: user ? 'Authenticated' : 'Not authenticated',
      isLoading,
      path: location.pathname,
      isCheckingAuth
    });
  }, [isLoading, user, location.pathname, isCheckingAuth]);

  // Clear any potential UI overlaps by forcing a small delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isCheckingAuth && !isLoading) {
        console.log('Forced auth check completion after timeout');
        setIsCheckingAuth(false);
      }
    }, 1000); // 1 second timeout as a fallback
    
    return () => clearTimeout(timer);
  }, [isCheckingAuth, isLoading]);

  if (isCheckingAuth || isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <span className="text-xl font-medium">Verifying authentication...</span>
      </div>
    );
  }

  if (!user) {
    console.log('Redirecting to login - No user found');
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
