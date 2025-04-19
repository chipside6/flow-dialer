
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";

interface LoadingErrorBoundaryProps {
  children: React.ReactNode;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  loadingComponent?: React.ReactNode;
  timeout?: number;
}

/**
 * A component that handles loading states, errors, and timeouts
 */
export const LoadingErrorBoundary: React.FC<LoadingErrorBoundaryProps> = ({
  children,
  isLoading,
  error,
  onRetry,
  loadingComponent,
  timeout = 10000 // Default timeout of 10 seconds
}) => {
  const [isStuck, setIsStuck] = useState(false);
  
  // Reset stuck state when loading or error state changes
  useEffect(() => {
    if (!isLoading) {
      setIsStuck(false);
      return;
    }
    
    // Set a timeout to detect stuck loading states
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsStuck(true);
      }
    }, timeout);
    
    return () => clearTimeout(timer);
  }, [isLoading, timeout]);
  
  // If there's an error, show error state
  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
        <h3 className="font-medium flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Something went wrong
        </h3>
        <p className="mt-1 mb-2">
          {error.message || "An error occurred while loading data."}
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }
  
  // Show loading state
  if (isLoading) {
    if (isStuck) {
      return (
        <div className="p-4 rounded-md mb-6 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          <h3 className="font-medium flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Loading is taking longer than expected
          </h3>
          <p className="mt-1 mb-2">
            This is taking longer than usual. You can wait or try again.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Loading
          </Button>
        </div>
      );
    }
    
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return null;
  }
  
  // Show children if not loading and no error
  return <>{children}</>;
};
