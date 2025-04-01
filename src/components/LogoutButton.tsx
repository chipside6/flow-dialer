
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  position?: "left" | "right";
  onClick?: () => void;
}

const LogoutButton = ({ 
  variant = "outline", 
  size = "default", 
  className = "",
  position = "right",
  onClick
}: LogoutButtonProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      await signOut();
      
      // Call the onClick handler if provided
      if (onClick) {
        onClick();
      }
      
      navigate("/login", { replace: true });
    } catch (error: any) {
      console.error("Logout error:", error);
      alert("Error during logout. Please try again.");
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
      {position === "left" && <LogOut className="h-4 w-4 mr-2" />}
      <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
      {position === "right" && <LogOut className="h-4 w-4 ml-2" />}
    </Button>
  );
};

export default LogoutButton;
