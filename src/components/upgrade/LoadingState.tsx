
import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingStateProps {
  message: string;
  onRetry?: () => Promise<boolean> | void;
  timeout?: number;
  showTimeoutError?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message, 
  onRetry, 
  timeout = 5000,
  showTimeoutError = true
}) => {
  const [showError, setShowError] = React.useState(false);
  
  React.useEffect(() => {
    if (!timeout || !showTimeoutError) return;
    
    const timer = setTimeout(() => {
      setShowError(true);
    }, timeout);
    
    return () => clearTimeout(timer);
  }, [timeout, showTimeoutError]);
  
  return (
    <div className="flex flex-col justify-center items-center p-8 w-full min-h-[200px]">
      <div className="text-center p-6 max-w-md">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-base text-gray-600">{message}</p>
        
        {showError && onRetry && (
          <div className="mt-4">
            <p className="text-sm text-amber-600 mb-2">
              This is taking longer than expected.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
