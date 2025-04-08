
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface NetworkErrorDisplayProps {
  isOnline: boolean;
  error: Error | null;
  onRetry: () => void;
}

export const NetworkErrorDisplay = ({ isOnline, error, onRetry }: NetworkErrorDisplayProps) => {
  if (isOnline && !error) return null;
  
  return (
    <>
      {!isOnline && (
        <Alert variant="destructive" className="mb-4 mx-auto max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
            <div>You appear to be offline. Please check your network connection.</div>
            <Button 
              variant="outline" 
              onClick={onRetry}
              size="sm"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive" className="mb-4 mx-auto max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
            <div>Error loading campaigns: {error.message}</div>
            <Button 
              variant="outline" 
              onClick={onRetry}
              size="sm"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
