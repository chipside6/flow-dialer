
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RotateCcw, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { clearAllAuthData } from "@/utils/sessionCleanup";

export const DiagnosticActions = ({ onRefresh }: { onRefresh: () => void }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleSignOut = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // IMMEDIATELY clear all auth data
      clearAllAuthData();
      
      // First navigate to login page immediately for better UX
      navigate("/login", { replace: true });
      
      // Then attempt to sign out as a background operation
      signOut().catch(error => {
        console.warn("DiagnosticActions - Error during sign out:", error);
      });
    } catch (error: any) {
      console.error("DiagnosticActions - Error signing out:", error);
      
      // Force navigation even on error
      navigate("/login", { replace: true });
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
