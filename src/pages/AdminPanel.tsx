
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UsersDataFetcher } from "@/components/admin/UsersDataFetcher";
import { CreateAdminButton } from "@/components/admin/CreateAdminButton";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";

const AdminPanel = () => {
  console.log("AdminPanel - Rendering component");
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const [isAuthorizing, setIsAuthorizing] = useState(true);
  
  useEffect(() => {
    // When auth state is determined, we're done authorizing
    if (!isLoading) {
      setIsAuthorizing(false);
    }
  }, [isLoading]);
  
  console.log("AdminPanel - Auth state:", { isAdmin, isAuthenticated, isLoading });
  
  // Show loading state while checking permissions
  if (isAuthorizing || isLoading) {
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }
  
  // Redirect non-admin users to the unauthorized page
  if (!isAuthenticated || !isAdmin) {
    console.log("AdminPanel - Access denied, redirecting to unauthorized page");
    return <Navigate to="/unauthorized" replace />;
  }
  
  return (
    <div className="w-full overflow-hidden">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <CreateAdminButton />
      </div>
      <UsersDataFetcher />
    </div>
  );
};

export default AdminPanel;
