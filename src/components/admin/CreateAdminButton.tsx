
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";

export function CreateAdminButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    try {
      console.log("CreateAdminButton - Invoking create-admin-user function");
      
      if (!isAuthenticated) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to create an admin user",
        });
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        method: 'POST',
        body: {}
      });
      
      if (error) {
        console.error("Error creating admin user:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create admin user: " + error.message,
        });
        return;
      }
      
      console.log("Admin user created response:", data);
      
      // Force refresh the user data
      toast({
        title: "Success",
        description: "Admin user created successfully! Refreshing data...",
      });
      
      // Wait a moment for the database to propagate the changes
      setTimeout(async () => {
        try {
          // Force invalidate and refetch admin users query
          await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
          await queryClient.refetchQueries({ queryKey: ["admin", "users"] });
          
          toast({
            title: "Success",
            description: "Admin user created/updated successfully! Email: admin@gmail.com, Password: test123",
          });
        } catch (refetchError) {
          console.error("Error refreshing data:", refetchError);
        }
      }, 2000); // Increased timeout to 2 seconds for better chances of data propagation
      
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
