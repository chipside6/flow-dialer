
import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoadingStateProps {
  message: string;
  timeout?: number; // Timeout in milliseconds
  onRetry?: () => void; // Optional retry callback
  errorVariant?: "default" | "destructive" | "warning"; // Added error styling options
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message, 
  timeout = 8000, // 8 seconds default timeout
  onRetry,
  errorVariant = "destructive" // Default to destructive red for timeouts
}) => {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Reset timeout when message or retry function changes
  useEffect(() => {
    setIsTimedOut(false);
    
    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, timeout);
    
    return () => clearTimeout(timer);
  }, [timeout, message, onRetry, retryCount]);
  
  // Handle retry with count tracking
  const handleRetry = () => {
    if (onRetry) {
      setRetryCount(prev => prev + 1);
      onRetry();
    }
  };
  
  if (isTimedOut) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen w-full">
        <Alert variant={errorVariant} className="mb-6 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-4">
            <span>Loading timeout reached. The server might be busy or there could be a connection issue.</span>
            {onRetry && (
              <Button 
                variant="outline" 
                onClick={handleRetry}
                className="flex items-center w-fit"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Loading
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full">
      <div className="text-center p-6 max-w-md">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-base text-gray-600">{message}</p>
      </div>
    </div>
  );
};
