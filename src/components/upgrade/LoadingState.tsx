
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
  timeout = 8000, // Reduced default timeout
  onRetry
}) => {
  const [isTimedOut, setIsTimedOut] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, timeout);
    
    return () => clearTimeout(timer);
  }, [timeout]);
  
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
              <Button 
                onClick={onRetry}
                className="flex items-center mt-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Loading
              </Button>
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
