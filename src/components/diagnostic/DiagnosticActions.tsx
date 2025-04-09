
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RotateCcw, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { clearAllAuthData, forceLogoutWithReload } from "@/utils/sessionCleanup";

export const DiagnosticActions = ({ onRefresh }: { onRefresh: () => void }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleSignOut = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // IMMEDIATELY clear all auth data
      clearAllAuthData();
      
      // First try to signout properly
      await signOut().catch(error => {
        console.warn("DiagnosticActions - Error during sign out:", error);
      });
      
      // Force a complete application reload to reset all state
      forceLogoutWithReload();
    } catch (error: any) {
      console.error("DiagnosticActions - Error signing out:", error);
      
      // Even on error, force app reload
      forceLogoutWithReload();
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
