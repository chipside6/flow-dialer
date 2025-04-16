
import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoadingStateProps {
  message: string;
  onRetry?: () => Promise<boolean> | void;
  timeout?: number;
  showTimeoutError?: boolean;
  showAlert?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message, 
  onRetry, 
  timeout = 5000,
  showTimeoutError = true,
  showAlert = false
}) => {
  const [showError, setShowError] = useState(false);
  const [longWait, setLongWait] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  
  useEffect(() => {
    if (!timeout || !showTimeoutError) return;
    
    // First shorter timeout for initial message
    const shortTimer = setTimeout(() => {
      setLongWait(true);
    }, timeout / 2);
    
    // Second longer timeout for showing retry button
    const longTimer = setTimeout(() => {
      setShowError(true);
    }, timeout);
    
    return () => {
      clearTimeout(shortTimer);
      clearTimeout(longTimer);
    };
  }, [timeout, showTimeoutError, attemptCount]);
  
  const handleRetry = async () => {
    setShowError(false);
    setLongWait(false);
    setAttemptCount(prev => prev + 1);
    
    if (onRetry) {
      await onRetry();
    }
  };
  
  return (
    <div className="flex flex-col justify-center items-center p-8 w-full min-h-[200px]">
      <div className="text-center p-6 max-w-md">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-base text-gray-600">{message}</p>
        
        {longWait && !showError && (
          <p className="text-sm text-amber-600 mt-2">
            This is taking a bit longer than expected...
          </p>
        )}
        
        {showError && (
          <>
            {showAlert && (
              <Alert variant="warning" className="mt-4 mb-2">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>
                  The operation is taking longer than expected.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-4">
              <p className="text-sm text-amber-600 mb-2">
                This is taking longer than expected.
              </p>
              {onRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
