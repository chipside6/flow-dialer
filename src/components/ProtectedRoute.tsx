
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
      path: location.pathname
    });
  }, [isLoading, user, location.pathname]);

  if (isCheckingAuth || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading authentication...</span>
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
