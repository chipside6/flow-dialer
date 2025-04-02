
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { Shield, AlertCircle, LogIn, ArrowLeft, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, initialized, user, profile, updateProfile } = useAuth();
  
  // Check if user came from admin panel
  const isFromAdmin = location.state?.from?.pathname === '/admin';
  
  // Debug function to refresh profile data
  const refreshAdminStatus = async () => {
    if (!user?.id) return;
    
    try {
      console.log("Manually refreshing admin status for user:", user.id);
      
      // Get fresh profile data directly from DB
      const { data, error } = await supabase
        .from('profiles')
        .select('id, is_admin')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error("Error refreshing profile:", error.message);
        return;
      }
      
      if (data) {
        console.log("Refreshed profile data:", data);
        
        // Update profile in context if found
        if (profile) {
          const updatedProfile = {
            ...profile,
            is_admin: data.is_admin === true // Force to boolean
          };
          updateProfile(updatedProfile);
          console.log("Profile updated with refreshed data:", updatedProfile);
        }
      }
    } catch (err) {
      console.error("Error in refreshAdminStatus:", err);
    }
  };
  
  // Auto-refresh on page load
  useEffect(() => {
    if (user?.id && !isAdmin) {
      refreshAdminStatus();
    }
  }, [user?.id, isAdmin]);
  
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
        
        <div className="space-y-4">
          {isAuthenticated ? (
            <>
              {isFromAdmin && isAdmin === false && (
                <div className="space-y-4">
                  <p className="text-sm text-center text-muted-foreground">
                    Your account doesn't have administrator privileges. 
                    Please contact an administrator for access.
                  </p>
                  <Button 
                    onClick={refreshAdminStatus} 
                    variant="outline" 
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Admin Status
                  </Button>
                </div>
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
