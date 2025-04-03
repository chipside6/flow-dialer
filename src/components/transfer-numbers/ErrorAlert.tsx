
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorAlertProps {
  error: string | null;
  onRetry: () => void;
  className?: string;
}

export const ErrorAlert = ({ error, onRetry, className = "" }: ErrorAlertProps) => {
  if (!error) return null;
  
  const isTimeout = error.toLowerCase().includes("timeout") || 
                    error.toLowerCase().includes("timed out");
  
  const isNetworkError = error.toLowerCase().includes("network") || 
                         error.toLowerCase().includes("connection") ||
                         error.toLowerCase().includes("internet");
  
  const isAuthError = error.toLowerCase().includes("auth") ||
                      error.toLowerCase().includes("login") ||
                      error.toLowerCase().includes("session");
                      
  let title = "Error";
  let variant: "warning" | "destructive" = "destructive";
  
  if (isTimeout || isNetworkError) {
    title = "Connection Error";
    variant = "warning";
  } else if (isAuthError) {
    title = "Authentication Error";
  }
  
  return (
    <Alert variant={variant} className={`mb-6 text-left ${className}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <span>{error}</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="w-fit mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
};
