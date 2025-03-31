
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Loader2, AlertCircle } from "lucide-react";
import { AdminPanel as AdminPanelComponent } from "@/components/admin/AdminPanel";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const AdminPage = () => {
  console.log("AdminPage - Rendering component");
  const { user, isAdmin, isAuthenticated, isLoading, initialized } = useAuth();
  const [isAuthorizing, setIsAuthorizing] = useState(true);
  const [manualCheckResult, setManualCheckResult] = useState<boolean | null>(null);
  const [isManualChecking, setIsManualChecking] = useState(false);
  const navigate = useNavigate();
  
  // Perform a direct check of admin status as a fallback
  const performManualAdminCheck = async () => {
    if (!user) return false;
    
    setIsManualChecking(true);
    try {
      console.log("AdminPage - Performing manual admin check for user:", user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("AdminPage - Manual admin check error:", error);
        return false;
      }
      
      console.log("AdminPage - Manual admin check result:", data);
      return !!data?.is_admin;
    } catch (err) {
      console.error("AdminPage - Error in manual admin check:", err);
      return false;
    } finally {
      setIsManualChecking(false);
    }
  };
  
  // Handle direct admin access attempt
  const handleAdminAccessAttempt = async () => {
    const result = await performManualAdminCheck();
    setManualCheckResult(result);
    
    if (result) {
      // If manual check confirms admin status, force update
      window.location.reload();
    }
  };
  
  useEffect(() => {
    // When auth state is fully determined, we're done authorizing
    if (initialized && !isLoading) {
      setIsAuthorizing(false);
      
      // If user is authenticated but admin status is false, perform manual check
      if (isAuthenticated && isAdmin === false) {
        performManualAdminCheck().then(result => {
          setManualCheckResult(result);
        });
      }
    }
  }, [isLoading, initialized, isAuthenticated, isAdmin]);
  
  console.log("AdminPage - Auth state:", { 
    isAdmin, 
    isAuthenticated, 
    isLoading, 
    initialized,
    isAuthorizing,
    manualCheckResult
  });
  
  // Show loading state while checking permissions
  if (isAuthorizing || isLoading || !initialized) {
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Checking admin permissions...</p>
      </div>
    );
  }
  
  // If the manual check passed, show admin panel
  if (manualCheckResult === true) {
    return <AdminPanelComponent />;
  }
  
  // If authenticated but needs admin verification
  if (isAuthenticated && isAdmin === false && manualCheckResult !== false) {
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center p-4">
        <Alert className="max-w-md mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your admin status could not be verified automatically. Click below to try again.
          </AlertDescription>
        </Alert>
        
        <Button 
          onClick={handleAdminAccessAttempt}
          disabled={isManualChecking}
        >
          {isManualChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying Access...
            </>
          ) : (
            "Verify Admin Access"
          )}
        </Button>
        
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  // Redirect non-admin users to the unauthorized page
  if (!isAuthenticated || isAdmin === false) {
    console.log("AdminPage - Access denied, redirecting to unauthorized page");
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <AdminPanelComponent />;
};

export default AdminPage;
