
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthRequiredAlertProps {
  isVisible: boolean;
}

export const AuthRequiredAlert = ({ isVisible }: AuthRequiredAlertProps) => {
  const navigate = useNavigate();
  
  if (!isVisible) return null;
  
  const handleLoginClick = () => {
    navigate('/login', { state: { returnTo: '/transfers' } });
  };
  
  return (
    <Alert variant="warning" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Authentication Required</AlertTitle>
      <AlertDescription className="mb-2">
        You need to be logged in to view and manage transfer numbers.
      </AlertDescription>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleLoginClick} 
        className="mt-2"
      >
        <LogIn className="h-4 w-4 mr-2" />
        Log In
      </Button>
    </Alert>
  );
};
