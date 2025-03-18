
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
      const { data, error } = await supabase.functions.invoke('create-admin-user');
      
      if (error) {
        console.error("Error creating admin user:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create admin user: " + error.message,
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Admin user created/updated successfully! Email: admin@gmail.com, Password: test123",
      });
      
      console.log("Admin user created response:", data);
      
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
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
