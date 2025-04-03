import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { Shield, AlertCircle, LogIn, ArrowLeft, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { withExponentialBackoff } from '@/utils/apiHelpers';
import { toast } from '@/components/ui/use-toast';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, initialized, user, profile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Check if user came from admin panel
  const isFromAdmin = location.state?.from?.pathname?.includes('/admin');
  
  // Auto-refresh admin status when coming from admin panel
  useEffect(() => {
    if (user?.id && isFromAdmin && !isAdmin && retryCount < 1) {
      refreshAdminStatus();
    }
  }, [user?.id, isAdmin, isFromAdmin, retryCount]);

  // Advanced error detection for auth state
  useEffect(() => {
    // Check for inconsistent auth state
    if (isAuthenticated && !user) {
      console.warn("Inconsistent auth state detected: authenticated but no user");
      toast({
        title: "Session Issue Detected",
        description: "Your session appears to be in an inconsistent state. Try refreshing the page.",
        variant: "destructive"
      });
    }
  }, [isAuthenticated, user]);

  // Debug function to refresh profile data
  const refreshAdminStatus = async () => {
    if (!user?.id || isRefreshing) return;
    
    setIsRefreshing(true);
    setRetryCount(prev => prev + 1);
    
    try {
      console.log("Manually refreshing admin status for user:", user.id);
      
      await withExponentialBackoff(async () => {
        // Instead of calling refreshUser which doesn't exist, we'll use a different approach
        // We'll reload the current page which will trigger a re-fetch of the user profile
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }, { maxRetries: 2 });
      
      // If user is now admin, redirect back to admin page
      if (isAdmin) {
        toast({
          title: "Admin Access Verified",
          description: "Your administrator access has been confirmed.",
        });
        
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
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
  
  // Fallback case - if the user has been stuck on this page for too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (document.visibilityState === 'visible' && isAuthenticated && !location.state) {
        // If user has been on this page for a while without context, offer dashboard
        toast({
          title: "Need help?",
          description: "You've been on this page for a while. Would you like to go to the dashboard?",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="mt-2"
            >
              Go to Dashboard
            </Button>
          ),
        });
      }
    }, 15000); // 15 seconds
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate, location.state]);
  
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
              <p><strong>Email:</strong> {user?.email || profile?.email || 'Unknown'}</p>
              <p><strong>Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
              <p><strong>Initialized:</strong> {initialized ? 'Yes' : 'No'}</p>
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
                    onClick={refreshAdminStatus}
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
