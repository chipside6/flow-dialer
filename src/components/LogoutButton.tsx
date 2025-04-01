
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

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
  const { signOut } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Call optional callback if provided
      if (onClick) onClick();
      
      // Check network status and show appropriate message
      if (!isOnline) {
        toast({
          title: "You're offline",
          description: "Your session will be cleared locally, but server logout will occur when you're back online.",
          variant: "warning"
        });
      }
      
      // Navigate to login page first for better UX
      navigate("/login", { replace: true });
      
      // Then attempt to sign out
      const { success, error } = await signOut();
      
      if (success) {
        toast({
          title: "Logged out successfully",
          description: "You have been signed out of your account",
        });
      } else if (error) {
        console.error("LogoutButton - Error during logout:", error);
        // Still consider it a successful logout for UX purposes
        toast({
          title: "Logged out",
          description: "You've been signed out, but there was an issue cleaning up session data.",
        });
      }
    } catch (error: any) {
      console.error("LogoutButton - Unexpected error during logout:", error);
      toast({
        title: "An error occurred",
        description: "There was an issue during logout, but you've been signed out.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, onClick, navigate, signOut, toast, isOnline]);
  
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
