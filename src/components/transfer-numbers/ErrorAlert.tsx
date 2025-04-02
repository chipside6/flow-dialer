
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
