
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { clearSession } from "@/services/auth/session";
import { clearAllAuthData, forceLogoutWithReload } from "@/utils/sessionCleanup";

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
      
      // IMMEDIATELY clear all auth data to prevent auto re-login
      clearAllAuthData();
      
      // Call the signOut function from auth context
      await signOut();
      
      // Navigate to login page before reload to ensure a clean state
      navigate('/login');
      
      // Force app reload after signOut and navigation to ensure complete state reset
      setTimeout(() => {
        forceLogoutWithReload();
      }, 100);
    } catch (error: any) {
      console.error("Logout error:", error);
      
      // If all else fails, clear session directly and force reload
      clearSession();
      navigate('/login');
      forceLogoutWithReload();
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
