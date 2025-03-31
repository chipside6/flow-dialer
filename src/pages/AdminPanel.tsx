
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";
import { AdminPanel as AdminPanelComponent } from "@/components/admin/AdminPanel";

const AdminPage = () => {
  console.log("AdminPage - Rendering component");
  const { isAdmin, isAuthenticated, isLoading, initialized } = useAuth();
  const [isAuthorizing, setIsAuthorizing] = useState(true);
  
  useEffect(() => {
    // When auth state is fully determined, we're done authorizing
    if (initialized && !isLoading) {
      setIsAuthorizing(false);
    }
  }, [isLoading, initialized]);
  
  console.log("AdminPage - Auth state:", { 
    isAdmin, 
    isAuthenticated, 
    isLoading, 
    initialized,
    isAuthorizing
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
  
  // Redirect non-admin users to the unauthorized page
  if (!isAuthenticated || isAdmin === false) {
    console.log("AdminPage - Access denied, redirecting to unauthorized page");
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <AdminPanelComponent />;
};

export default AdminPage;
