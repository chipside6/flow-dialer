
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UsersDataFetcher } from "@/components/admin/UsersDataFetcher";
import { Loader2 } from "lucide-react";

const AdminPanel = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only redirect if we're done loading and the user isn't authenticated
    if (!isLoading && !user) {
      console.log("AdminPanel - User not authenticated, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [user, isLoading, navigate]);

  // If still checking auth, show minimal loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Checking authentication...</p>
      </div>
    );
  }

  // If no user, don't render anything (redirect will happen in useEffect)
  if (!user) {
    return null;
  }

  // User is authenticated, render the admin panel
  return <UsersDataFetcher />;
};

export default AdminPanel;
