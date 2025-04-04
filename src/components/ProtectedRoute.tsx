
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading, initialized } = useAuth();
  const location = useLocation();
  const [showSkeleton, setShowSkeleton] = useState(true);
  
  // Add a timeout to show skeleton for at least 300ms to prevent flashing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show loading state while auth is being determined, but only if we're initialized or loading
  if ((isLoading || !initialized) && showSkeleton) {
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
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }
  
  // If admin required but user is not admin, redirect to unauthorized
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User is authenticated (and admin if required), render children
  return <>{children}</>;
};

export default ProtectedRoute;
