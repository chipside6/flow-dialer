
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
        <div>
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
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="mt-2 md:mt-0 self-start"
        >
          Try Again
        </Button>
      </div>
    </Alert>
  );
};
