
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
  
  const handleLogout = async () => {
    try {
      console.log("LogoutButton - Initiating logout");
      const { success, error } = await signOut();
      
      // Optional callback if provided
      if (onClick) onClick();
      
      if (error) {
        console.error("LogoutButton - Error during logout:", error);
        toast({
          title: "Logout failed",
          description: error.message,
          variant: "destructive",
        });
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
