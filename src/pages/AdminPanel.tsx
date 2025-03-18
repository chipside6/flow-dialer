
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UsersDataFetcher } from "@/components/admin/UsersDataFetcher";
import { Loader2 } from "lucide-react";

const AdminPanel = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [forceTimeout, setForceTimeout] = useState(false);
  
  useEffect(() => {
    console.log("AdminPanel - Auth status:", { 
      isLoading, 
      hasUser: !!user, 
      authChecked,
      forceTimeout
    });

    // Set a timeout to force continue after 3 seconds
    // This prevents getting stuck in authentication checking
    const timer = setTimeout(() => {
      if (!authChecked) {
        console.log("AdminPanel - Force timeout triggered, proceeding with available auth state");
        setForceTimeout(true);
        setAuthChecked(true);
      }
    }, 3000);

    // Only redirect if we're done loading and the user isn't authenticated
    if (!isLoading) {
      setAuthChecked(true);
      if (!user) {
        console.log("AdminPanel - User not authenticated, redirecting to login");
        navigate("/login");
      }
    }

    return () => clearTimeout(timer);
  }, [user, isLoading, navigate, authChecked]);

  // If still checking auth but force timeout triggered, proceed with available data
  if (forceTimeout && !user) {
    console.log("AdminPanel - Force timeout, no user, redirecting");
    navigate("/login");
    return null;
  }

  // If still checking auth and no force timeout, show loading
  if (isLoading && !authChecked && !forceTimeout) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Checking authentication...</p>
      </div>
    );
  }

  // If auth check completed but no user, show nothing (redirect will happen)
  if (!user) {
    console.log("AdminPanel - No user after auth check, redirecting");
    navigate("/login");
    return null;
  }

  // User is authenticated, render the admin panel
  console.log("AdminPanel - Rendering admin panel for authenticated user");
  return <UsersDataFetcher />;
};

export default AdminPanel;
