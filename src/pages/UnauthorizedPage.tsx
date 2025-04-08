
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { Shield, AlertCircle, LogIn, ArrowLeft, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { refreshAdminStatus } from '@/contexts/auth/authUtils';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Check if user came from admin panel
  const isFromAdmin = location.state?.from?.pathname?.includes('/admin');
  
  // Improved and more reliable admin status refresh
  const handleRefreshAdminStatus = async () => {
    if (!user?.id || isRefreshing) return;
    
    setIsRefreshing(true);
    setRetryCount(prev => prev + 1);
    
    try {
      console.log("Manually refreshing admin status for user:", user.id);
      
      // Pass the user.id to the refreshAdminStatus function
      const isUserAdmin = await refreshAdminStatus(user.id);
      
      if (isUserAdmin) {
        toast({
          title: "Admin Access Verified",
          description: "Your administrator access has been confirmed.",
        });
        
        // Redirect back to admin page
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have administrator privileges. If this is unexpected, contact support.",
        });
      }
    } catch (err) {
      console.error("Error in refreshAdminStatus:", err);
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh your permissions. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] p-6">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-destructive/10 rounded-full mb-4">
            <Shield className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-center">Access Restricted</h1>
          <p className="text-muted-foreground text-center mt-2">
            You don't have permission to access this area
          </p>
        </div>
        
        {isAuthenticated && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Status</AlertTitle>
            <AlertDescription className="space-y-2 mt-2">
              <p><strong>User ID:</strong> {user?.id || 'Unknown'}</p>
              <p><strong>Email:</strong> {user?.email || 'Unknown'}</p>
              <p><strong>Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
            </AlertDescription>
          </Alert>
        )}
        
        {isFromAdmin && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Admin privileges required</AlertTitle>
            <AlertDescription>
              This section requires administrator privileges to access.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4 flex flex-col items-center">
          {isAuthenticated ? (
            <>
              {isFromAdmin && isAdmin === false && (
                <div className="space-y-4 w-full text-center">
                  <p className="text-sm text-center text-muted-foreground">
                    Your account doesn't have administrator privileges. 
                    Please contact an administrator for access.
                  </p>
                  <Button
                    onClick={handleRefreshAdminStatus}
                    variant="outline"
                    disabled={isRefreshing || retryCount >= 3}
                    className="w-full max-w-xs"
                  >
                    {isRefreshing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh Admin Status
                      </>
                    )}
                  </Button>
                </div>
              )}
              <Button 
                onClick={() => navigate(-1)} 
                variant="outline" 
                className="w-full max-w-xs"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-full max-w-xs"
              >
                Go to Dashboard
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-center text-muted-foreground mb-4">
                You need to sign in with an administrator account to access this area.
              </p>
              <Button 
                onClick={() => navigate('/login', { state: { from: { pathname: '/admin' } } })} 
                className="w-full max-w-xs"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign in as Administrator
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                className="w-full max-w-xs"
              >
                Go to Home
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
