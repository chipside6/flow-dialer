
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function CreateAdminButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    try {
      console.log("CreateAdminButton - Invoking create-admin-user function");
      
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        // Set a reasonable timeout for the function
        method: 'POST',
        body: {},
        timeout: 20000 // 20 seconds timeout
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
        description: "Admin user created/updated successfully! Email: admin@gmail.com, Password: test123",
      });
      
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
      disabled={isLoading}
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
