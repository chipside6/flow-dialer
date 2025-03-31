
import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminPanel as AdminPanelComponent } from "@/components/admin/AdminPanel";

const AdminPage = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Simple check for admin status
    const checkAdminStatus = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }
        
        // Check if user is admin in profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data?.is_admin);
        }
      } catch (err) {
        console.error("Unexpected error checking admin status:", err);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-lg text-muted-foreground">Checking admin permissions...</p>
      </div>
    );
  }
  
  // Redirect non-admin users
  if (isAdmin === false) {
    return <Navigate to="/unauthorized" state={{ from: { pathname: '/admin' } }} replace />;
  }
  
  return <AdminPanelComponent />;
};

export default AdminPage;
