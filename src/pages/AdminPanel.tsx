
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UsersDataFetcher } from "@/components/admin/UsersDataFetcher";

const AdminPanel = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only redirect if we're done loading and the user isn't authenticated
    if (!isLoading && !user) {
      console.log("AdminPanel - User not authenticated, redirecting to login");
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // If user isn't authenticated, show loading until the redirect happens
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return <UsersDataFetcher />;
};

export default AdminPanel;
