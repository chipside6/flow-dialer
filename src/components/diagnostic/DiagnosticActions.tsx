
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RotateCcw, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";

export const DiagnosticActions = ({ onRefresh }: { onRefresh: () => void }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleSignOut = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    try {
      setIsLoggingOut(true);
      console.log("DiagnosticActions - Initiating logout");
      
      const result = await signOut();
      
      // Force navigation to login page immediately
      console.log("Navigating to login page");
      navigate("/login", { replace: true });
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account"
      });
      
      // Check for errors after toast (to ensure user sees success message)
      if (result.error) {
        console.warn("DiagnosticActions - Warning during logout:", result.error);
      }
    } catch (error: any) {
      console.error("DiagnosticActions - Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message || "An error occurred while signing out"
      });
      
      // Still try to navigate to login
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-2 mt-4">
      <Button variant="outline" onClick={onRefresh} className="flex items-center">
        <RotateCcw className="h-4 w-4 mr-2" />
        Refresh Status
      </Button>
      <Button 
        variant="outline" 
        onClick={handleSignOut} 
        className="flex items-center"
        disabled={isLoggingOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {isLoggingOut ? "Signing Out..." : "Sign Out"}
      </Button>
    </div>
  );
};
