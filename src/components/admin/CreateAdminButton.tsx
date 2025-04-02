
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export function CreateAdminButton() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { isAuthenticated, signOut } = useAuth();

  const handleCreateAdmin = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to create an admin user");
      return;
    }
    
    setIsLoading(true);
    
    try {
      toast.info("Creating admin user...");
      console.log("CreateAdminButton - Invoking create-admin-user function");
      
      // Use the Supabase Edge Function
      const { data, error: funcError } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: 'admin@example.com',
          password: 'admin123'
        }
      });
      
      if (funcError) {
        throw new Error(funcError.message || "Failed to invoke create-admin-user function");
      }
      
      if (!data?.success) {
        throw new Error(data?.error || "Unknown error occurred");
      }
      
      console.log("Admin user created response:", data);
      
      toast.success("Admin user created successfully! Email: admin@example.com, Password: admin123");
      
      // Force invalidate and refetch admin users query immediately
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      
      // Let the user know they should log out and log back in as admin
      setTimeout(() => {
        toast.info("To use admin privileges, please log out and log back in as admin@example.com", {
          duration: 8000,
          action: {
            label: "Log Out Now",
            onClick: () => signOut?.()
          }
        });
      }, 2000);
      
    } catch (err: any) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred while creating admin user: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateAdmin} 
      disabled={isLoading || !isAuthenticated}
      variant="default"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Admin...
        </>
      ) : (
        "Create Admin User"
      )}
    </Button>
  );
}
