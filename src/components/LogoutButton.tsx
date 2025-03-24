
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { useState, useEffect } from "react";

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Set a cleanup timer if logout takes too long
  useEffect(() => {
    if (!isLoggingOut) return;
    
    const timeoutId = setTimeout(() => {
      if (isLoggingOut) {
        console.log("LogoutButton - Logout timeout reached, forcing logout completion");
        setIsLoggingOut(false);
        navigate("/login", { replace: true });
      }
    }, 3000); // 3 second timeout as fallback
    
    return () => clearTimeout(timeoutId);
  }, [isLoggingOut, navigate]);
  
  const handleLogout = async () => {
    if (isLoggingOut) {
      // If already logging out, force navigation to login
      navigate("/login", { replace: true });
      return;
    }
    
    setIsLoggingOut(true);
    console.log("LogoutButton - Initiating logout");
    
    // Force navigation to login page IMMEDIATELY - this is the most critical part
    navigate("/login", { replace: true });
    
    // Run the logout process after navigation has been triggered
    try {
      console.log("LogoutButton - Calling signOut");
      const result = await signOut();
      
      // Optional callback if provided
      if (onClick) onClick();
      
      // Show success toast
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account",
      });
      
      // Check for errors after toast (to ensure user sees success message)
      if (result.error) {
        console.warn("LogoutButton - Warning during logout:", result.error);
      }
    } catch (error: any) {
      console.error("LogoutButton - Error during logout:", error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
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
      <LogOut className="h-4 w-4 mr-2" /> <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
    </Button>
  );
};

export default LogoutButton;
