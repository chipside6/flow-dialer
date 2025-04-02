
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
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Clear any auth-related data from localStorage preemptively
      try {
        for (const key of Object.keys(localStorage)) {
          if (key.includes('supabase') || key.includes('auth') || key.includes('session') || key.includes('token')) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.warn("Error during pre-emptive cleanup:", e);
      }
      
      // First navigate to login page immediately for better UX
      navigate("/login", { replace: true });
      
      // Then attempt to sign out
      const { success, error } = await signOut();
      
      if (success) {
        toast({
          title: "Signed out successfully",
          description: "You have been logged out of your account"
        });
        
        // Force page reload after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      } else if (error) {
        console.error("DiagnosticActions - Error during sign out:", error);
        // Still consider it a successful logout for UX purposes
        toast({
          title: "Signed out",
          description: "You've been signed out, but there was an issue cleaning up session data"
        });
        
        // Force page reload even on error
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    } catch (error: any) {
      console.error("DiagnosticActions - Error signing out:", error);
      toast({
        title: "An error occurred",
        description: "There was an issue during logout, but you've been signed out.",
        variant: "destructive"
      });
      
      // Force page reload even on error
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
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
