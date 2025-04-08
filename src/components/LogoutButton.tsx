
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { clearSession } from "@/services/auth/session";

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { signOut } = useAuth();
  
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Call optional callback if provided
      if (onClick) onClick();
      
      // Immediately clear session for faster feedback
      clearSession();
      
      // Navigate to login page directly
      navigate("/login", { replace: true });
      
      // Then attempt to sign out in the background
      signOut().catch(error => {
        console.error("Background signout error:", error);
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      
      // Force navigation even on error
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  const buttonClasses = `${className} ${position === "left" ? "justify-start" : "justify-center"}`;
  
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleLogout} 
      className={buttonClasses}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span>Logging out...</span>
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4 mr-2" /> 
          <span>Logout</span>
        </>
      )}
    </Button>
  );
};

export default LogoutButton;
