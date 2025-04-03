
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { clearAllAuthData } from "@/utils/sessionCleanup";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClick?: () => void;
  position?: "left" | "right";
}

const LogoutButton = ({ 
  variant = "outline", 
  size = "default", 
  className = "", 
  onClick,
  position = "right"
}: LogoutButtonProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Call optional callback if provided
      if (onClick) onClick();
      
      // Clear all auth data first
      clearAllAuthData();
      
      // Navigate to login page
      navigate("/login", { replace: true });
      
      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during logout:", error);
        toast({
          title: "Logout issue",
          description: "You've been signed out, but there was an issue cleaning up session data.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Logged out successfully",
          description: "You have been signed out of your account",
        });
      }
      
      // Force page reload to clear any remaining state
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error: any) {
      console.error("Unexpected error during logout:", error);
      toast({
        title: "An error occurred",
        description: "There was an issue during logout, but you've been signed out.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, onClick, navigate, toast]);
  
  const buttonClasses = `${className} ${position === "left" ? "justify-start" : "justify-center"}`;
  
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleLogout} 
      className={buttonClasses}
      disabled={isLoggingOut}
    >
      <LogOut className="h-4 w-4 mr-2" /> 
      <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
    </Button>
  );
};

export default LogoutButton;
