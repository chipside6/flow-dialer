
import React, { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { RegisterDeviceForm } from './RegisterDeviceForm';
import { GoipDeviceList } from './GoipDeviceList';
import { PortMonitorLoading } from './PortMonitorLoading';
import { LoadingErrorBoundary } from '@/components/common/LoadingErrorBoundary';
import { useToast } from '@/hooks/use-toast';

export const GoipDeviceSetup = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate refresh/retry
    toast({
      title: "Refreshing data",
      description: "Attempting to reload device information"
    });
    
    // This would typically trigger a data refetch
    setTimeout(() => setIsLoading(false), 1000);
  };
  
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">GoIP Registration Guide</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          <p className="mb-1">Follow these steps to register your GoIP device:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Enter a name for your device (e.g., "Office-GoIP1")</li>
            <li>Provide your device's IP address or hostname</li>
            <li>Specify how many ports your device has (usually 1, 4, or 8)</li>
          </ol>
        </AlertDescription>
      </Alert>
      
      <RegisterDeviceForm />
      
      <LoadingErrorBoundary
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        loadingComponent={<PortMonitorLoading onRetry={handleRetry} />}
      >
        <GoipDeviceList />
      </LoadingErrorBoundary>
    </div>
  );
};
