
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
      
      // Use the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: 'admin@gmail.com',
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
        return;
      }
      
      console.log("Admin user created response:", data);
      
      toast({
        title: "Success",
        description: "Admin user created successfully! Refreshing data...",
      });
      
      // Force invalidate and refetch admin users query
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      
      // Also update current user profile if needed
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
          
        console.log("Current user admin status check:", profileData);
        
        if (!profileError && !profileData?.is_admin) {
          const { data: updateData, error: updateError } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', user.id);
            
          if (!updateError) {
            toast({
              title: "Admin Access Granted",
              description: "Your account now has admin privileges. You may need to refresh.",
            });
            
            // Force page refresh to update permissions
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          }
        }
      } catch (profileCheckError) {
        console.error("Error checking current user profile:", profileCheckError);
      }
      
      // Refetch after a short delay to allow database changes to propagate
      setTimeout(async () => {
        try {
          await queryClient.refetchQueries({ queryKey: ["admin", "users"] });
          
          toast({
            title: "Success",
            description: "Admin user created/updated successfully! Email: admin@gmail.com, Password: test123",
          });
        } catch (refetchError) {
          console.error("Error refreshing data:", refetchError);
        }
      }, 1000);
      
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
