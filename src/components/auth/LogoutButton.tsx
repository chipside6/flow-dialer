
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClick?: () => void;
}

export const LogoutButton = ({ 
  variant = "outline", 
  size = "default", 
  className = "", 
  onClick
}: LogoutButtonProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Call optional callback if provided
      if (onClick) onClick();
      
      // Then attempt to sign out
      const { success, error } = await signOut();
      
      if (success) {
        toast({
          title: "Logged out successfully",
          description: "You have been signed out of your account",
        });
        
        // Navigate to login page after successful logout
        navigate("/login", { replace: true });
      } else if (error) {
        console.error("LogoutButton - Error during logout:", error);
        toast({
          title: "Logout issue",
          description: "Encountered an issue during logout. You may need to clear your browser cache.",
          variant: "destructive"
        });
        
        // Still navigate to login even if there was an error
        navigate("/login", { replace: true });
      }
    } catch (error: any) {
      console.error("LogoutButton - Error during logout:", error);
      toast({
        title: "Logout error",
        description: "An error occurred during logout: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
      
      // Force navigation to login on error
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleLogout} 
      className={className}
      disabled={isLoggingOut}
    >
      <LogOut className="h-4 w-4 mr-2" /> 
      <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
    </Button>
  );
};
