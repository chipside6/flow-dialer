
import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingStateProps {
  message: string;
  timeout?: number; // Timeout in milliseconds
  onRetry?: () => void; // Optional retry callback
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message, 
  timeout = 8000, // Default timeout reduced to 8 seconds from 10
  onRetry
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
  }, [timeout, message, onRetry, retryCount]); // Add retryCount to dependencies
  
  // Handle retry with count tracking
  const handleRetry = () => {
    if (onRetry) {
      setRetryCount(prev => prev + 1);
      onRetry();
    }
  };
  
  return (
    <div className="flex flex-col justify-center items-center min-h-[40vh]">
      <div className="text-center p-6 max-w-md">
        {isTimedOut ? (
          <>
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
            <p className="text-base text-gray-600 mb-4">
              This is taking longer than expected. The server might be busy or there could be a connection issue.
            </p>
            {onRetry && (
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleRetry}
                  className="flex items-center mx-auto"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Loading
                </Button>
                
                {retryCount > 0 && (
                  <Button 
                    variant="ghost" 
                    onClick={() => window.location.reload()}
                    className="text-sm mt-2"
                  >
                    Refresh Entire Page
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-base text-gray-600">{message}</p>
          </>
        )}
      </div>
    </div>
  );
};
