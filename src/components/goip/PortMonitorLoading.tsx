
import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PortMonitor } from './PortMonitor';

interface PortMonitorLoadingProps {
  userId?: string;
  timeout?: number;
  onRetry: () => void;
}

export const PortMonitorLoading: React.FC<PortMonitorLoadingProps> = ({
  userId,
  timeout = 8000, // Default timeout of 8 seconds
  onRetry
}) => {
  const [isTimedOut, setIsTimedOut] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, timeout);
    
    return () => clearTimeout(timer);
  }, [timeout]);
  
  if (isTimedOut) {
    return (
      <Alert variant="warning" className="bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 mb-4">
        <AlertTitle className="flex items-center gap-2 font-medium">
          Loading is taking longer than expected
        </AlertTitle>
        <AlertDescription className="space-y-2">
          <p>This is taking longer than usual. You can wait or try again.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Loading
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="p-6 flex flex-col items-center justify-center space-y-4 animate-pulse">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground">Loading port status...</p>
    </div>
  );
};
