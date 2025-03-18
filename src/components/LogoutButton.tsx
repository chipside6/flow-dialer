
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  className?: string;
}

const LogoutButton = ({ 
  variant = "outline", 
  size = "default", 
  showIcon = true,
  className = "" 
}: LogoutButtonProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      toast({
        title: "Logging out",
        description: "Please wait...",
      });
      await signOut();
      navigate("/");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: error.message || "Something went wrong during logout",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleLogout}
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      Logout
    </Button>
  );
};

export default LogoutButton;
