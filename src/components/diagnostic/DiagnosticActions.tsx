
import React from 'react';
import { Button } from "@/components/ui/button";
import { RotateCcw, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";

export const DiagnosticActions = ({ onRefresh }: { onRefresh: () => void }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSignOut = async () => {
    try {
      const { success, error } = await signOut();
      
      if (success) {
        toast({
          title: "Signed out successfully",
          description: "You have been logged out of your account"
        });
        navigate('/login');
      } else {
        throw error;
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message || "An error occurred while signing out"
      });
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-2 mt-4">
      <Button variant="outline" onClick={onRefresh} className="flex items-center">
        <RotateCcw className="h-4 w-4 mr-2" />
        Refresh Status
      </Button>
      <Button variant="outline" onClick={handleSignOut} className="flex items-center">
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};
