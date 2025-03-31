
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { Shield, AlertCircle, LogIn, ArrowLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, initialized } = useAuth();
  const [isCheckingDirectly, setIsCheckingDirectly] = useState(false);
  const [directAdminCheck, setDirectAdminCheck] = useState<boolean | null>(null);
  
  // Check if user came from admin panel
  const isFromAdmin = location.state?.from?.pathname === '/admin';
  
  // Perform a direct database check for admin privileges
  const checkAdminPrivilegesDirectly = async () => {
    if (!user) return;
    
    setIsCheckingDirectly(true);
    try {
      console.log("UnauthorizedPage - Checking admin privileges directly for user:", user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("UnauthorizedPage - Admin check error:", error);
        setDirectAdminCheck(false);
        return;
      }
      
      const isUserAdmin = !!data?.is_admin;
      console.log("UnauthorizedPage - Direct admin check result:", { isUserAdmin, data });
      setDirectAdminCheck(isUserAdmin);
      
      // If user is actually an admin according to the database, redirect to admin
      if (isUserAdmin) {
        setTimeout(() => {
          navigate('/admin');
        }, 500);
      }
    } catch (err) {
      console.error("UnauthorizedPage - Error checking admin privileges:", err);
      setDirectAdminCheck(false);
    } finally {
      setIsCheckingDirectly(false);
    }
  };
  
  // Automatically check admin status when the page loads
  useEffect(() => {
    if (isAuthenticated && isFromAdmin) {
      checkAdminPrivilegesDirectly();
    }
  }, [isAuthenticated, isFromAdmin]);
  
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
              {isFromAdmin && !isAdmin && directAdminCheck === null && (
                <div className="text-sm text-center text-muted-foreground mb-4">
                  <p className="mb-2">Checking your admin privileges in the database...</p>
                  {isCheckingDirectly && <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />}
                </div>
              )}
              
              {isFromAdmin && directAdminCheck === true && (
                <Alert className="mb-4">
                  <AlertTitle>Admin access confirmed</AlertTitle>
                  <AlertDescription>
                    You have admin privileges in the database. Redirecting to admin panel...
                  </AlertDescription>
                </Alert>
              )}
              
              {isFromAdmin && directAdminCheck === false && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Admin access denied</AlertTitle>
                  <AlertDescription>
                    The database confirms you do not have administrator privileges.
                    Please contact an administrator for access.
                  </AlertDescription>
                </Alert>
              )}
              
              {isFromAdmin && (
                <Button 
                  onClick={checkAdminPrivilegesDirectly} 
                  disabled={isCheckingDirectly || directAdminCheck === true}
                  className="w-full"
                >
                  {isCheckingDirectly ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking Admin Access...
                    </>
                  ) : (
                    "Check Admin Access Again"
                  )}
                </Button>
              )}
              
              <Button 
                onClick={() => navigate(-1)} 
                variant="outline" 
                className="w-full mt-2"
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
