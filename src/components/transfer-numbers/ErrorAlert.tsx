
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ErrorAlertProps {
  error: string | null;
  onRetry: () => void;
}

export const ErrorAlert = ({ error, onRetry }: ErrorAlertProps) => {
  if (!error) return null;
  
  const isTimeout = error.toLowerCase().includes("timeout") || 
                    error.toLowerCase().includes("timed out");
  
  const isNetworkError = error.toLowerCase().includes("network") || 
                         error.toLowerCase().includes("connection");
  
  return (
    <Alert variant={isTimeout || isNetworkError ? "warning" : "destructive"} className="mb-6 text-left">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        {isTimeout 
          ? "Connection Timeout" 
          : isNetworkError 
            ? "Network Error" 
            : "Error"}
      </AlertTitle>
      <AlertDescription>
        <span>{error}</span>
      </AlertDescription>
    </Alert>
  );
};
