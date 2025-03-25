
import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface LoadingStateProps {
  message: string;
  timeout?: number; // Timeout in milliseconds
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message, 
  timeout = 15000 // Default 15 seconds
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
      <div className="text-center">
        {isTimedOut ? (
          <>
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
            <p className="text-base text-gray-600">
              This is taking longer than expected. You may want to refresh the page or try again later.
            </p>
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
