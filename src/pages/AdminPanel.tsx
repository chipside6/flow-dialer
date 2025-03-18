
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UsersDataFetcher } from "@/components/admin/UsersDataFetcher";
import { Loader2 } from "lucide-react";

const AdminPanel = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    console.log("AdminPanel - Auth status:", { 
      isLoading, 
      hasUser: !!user, 
      authChecked 
    });

    // Only redirect if we're done loading and the user isn't authenticated
    if (!isLoading) {
      setAuthChecked(true);
      if (!user) {
        console.log("AdminPanel - User not authenticated, redirecting to login");
        navigate("/login");
      }
    }
  }, [user, isLoading, navigate, authChecked]);

  // If still checking auth or no user, show loading
  if (isLoading || (!user && !authChecked)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Checking authentication...</p>
      </div>
    );
  }

  // If auth check completed but no user, show nothing (redirect will happen)
  if (!user) {
    return null;
  }

  // User is authenticated, render the admin panel
  console.log("AdminPanel - Rendering admin panel for authenticated user");
  return <UsersDataFetcher />;
};

export default AdminPanel;
