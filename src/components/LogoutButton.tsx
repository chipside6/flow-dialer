
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

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
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      console.log("LogoutButton - Initiating logout");
      const result = await signOut();
      
      // Optional callback if provided
      if (onClick) onClick();
      
      // Check if result is defined and has an error property
      if (result && 'error' in result && result.error) {
        // If there's an error, we already show a toast in the useAuthOperations hook
        console.error("LogoutButton - Error from signOut:", result.error);
      } else {
        // No error, proceed with navigation and success toast
        navigate("/");
        
        toast({
          title: "Logged out successfully",
          description: "You have been signed out of your account",
        });
      }
    } catch (error: any) {
      console.error("LogoutButton - Error during logout:", error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    }
  };
  
  const buttonClasses = `${className} ${position === "left" ? "justify-start" : "justify-center"}`;
  
  return (
    <Button variant={variant} size={size} onClick={handleLogout} className={buttonClasses}>
      <LogOut className="h-4 w-4 mr-2" /> <span>Logout</span>
    </Button>
  );
};

export default LogoutButton;
