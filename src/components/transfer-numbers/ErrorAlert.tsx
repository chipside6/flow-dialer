
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorAlertProps {
  error: string | null;
  onRetry: () => void;
}

export const ErrorAlert = ({ error, onRetry }: ErrorAlertProps) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error loading transfer numbers</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRetry} 
        className="mt-2"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </Alert>
  );
};
