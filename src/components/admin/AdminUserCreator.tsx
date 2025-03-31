
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";

export function AdminUserCreator() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    try {
      console.log("AdminUserCreator - Invoking create-admin-user function");
      
      if (!isAuthenticated || !user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to create an admin user",
        });
        setIsLoading(false);
        return;
      }
      
      // Use the Supabase Edge Function with the specific credentials
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: 'cchips474@gmail.com',
          password: 'test123'
        }
      });
      
      if (error) {
        console.error("Error creating admin user:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create admin user: " + error.message,
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Admin user created response:", data);
      
      toast({
        title: "Success",
        description: "Admin user created successfully! You can now log in with cchips474@gmail.com and password test123",
      });
      
      // Refresh the user list if this page has that component
      queryClient.invalidateQueries(["admin", "users"]);
      
      // If it's the current user, update their profile
      if (user?.email === 'cchips474@gmail.com') {
        toast({
          title: "Admin Access",
          description: "Your account now has admin privileges. The page will refresh shortly.",
        });
        
        // Force page refresh after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
      
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while creating admin user",
      });
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
