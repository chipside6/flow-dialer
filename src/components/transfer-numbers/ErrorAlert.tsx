
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
      <AlertDescription className="flex flex-col gap-2">
        <span>{error}</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry} 
          className="w-fit mt-2 bg-destructive/10 text-destructive hover:bg-destructive/20"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
};
