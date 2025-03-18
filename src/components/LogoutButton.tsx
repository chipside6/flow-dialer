
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  onClick?: () => void; // Add onClick prop
}

const LogoutButton = ({ variant = "outline", className, onClick }: LogoutButtonProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut();
    navigate("/");
    // Call the onClick handler if provided
    if (onClick) onClick();
  };
  
  return (
    <Button variant={variant} onClick={handleLogout} className={className}>
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  );
};

export default LogoutButton;
