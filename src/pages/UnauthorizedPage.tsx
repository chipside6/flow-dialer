
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { Shield, AlertCircle, LogIn, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, initialized } = useAuth();
  
  // Check if user came from admin panel
  const isFromAdmin = location.state?.from?.pathname === '/admin';
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-destructive/10 rounded-full mb-4">
            <Shield className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-center">Access Restricted</h1>
          <p className="text-muted-foreground text-center mt-2">
            You don't have permission to access this area
          </p>
        </div>
        
        {isFromAdmin && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Admin privileges required</AlertTitle>
            <AlertDescription>
              This section requires administrator privileges to access.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {isAuthenticated ? (
            <>
              {isFromAdmin && isAdmin === false && (
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Your account doesn't have administrator privileges. 
                  Please contact an administrator for access.
                </p>
              )}
              {isFromAdmin && isAdmin === null && !initialized && (
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Checking your privileges...
                </p>
              )}
              <Button 
                onClick={() => navigate(-1)} 
                variant="outline" 
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-center text-muted-foreground mb-4">
                You need to sign in with an administrator account to access this area.
              </p>
              <Button 
                onClick={() => navigate('/login', { state: { from: { pathname: '/admin' } } })} 
                className="w-full"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign in as Administrator
              </Button>
            </>
          )}
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="w-full"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
