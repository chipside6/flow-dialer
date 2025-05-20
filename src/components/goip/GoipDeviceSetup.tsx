
import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { RegisterDeviceForm } from './RegisterDeviceForm';
import { GoipDeviceList } from './GoipDeviceList';
import { PortMonitorLoading } from './PortMonitorLoading';
import { LoadingErrorBoundary } from '@/components/common/LoadingErrorBoundary';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const GoipDeviceSetup = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [devices, setDevices] = useState([]);
  
  const fetchDevices = async () => {
    if (!user?.id) return;
    
    logger.info("Starting to fetch devices for user:", user.id);
    console.log("Fetching devices for user:", user?.id);
    setIsLoading(true);
    setError(null);
    
    try {
      // Attempt to fetch user devices to check if the API is responding
      const { data, error } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("DB error fetching devices:", error);
        throw error;
      }
      
      // Successfully fetched devices (or empty array)
      logger.info("Successfully fetched devices, count:", data?.length || 0);
      console.log("Successfully fetched devices, count:", data?.length || 0);
      setDevices(data || []);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching devices:", err);
      logger.error("Error fetching devices:", err);
      setError(err instanceof Error ? err : new Error('Failed to load devices'));
      setIsLoading(false);
    }
  };
  
  // Load devices on initial render
  useEffect(() => {
    if (user?.id) {
      fetchDevices();
    } else {
      console.log("No user ID available, cannot fetch devices");
      setIsLoading(false);
    }
  }, [user?.id]);
  
  const handleRetry = () => {
    console.log("Retrying device fetch");
    setIsLoading(true);
    setError(null);
    
    // Simulate refresh/retry
    toast({
      title: "Refreshing data",
      description: "Attempting to reload device information"
    });
    
    fetchDevices();
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
      
      <RegisterDeviceForm onSuccess={fetchDevices} />
      
      <LoadingErrorBoundary
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        loadingComponent={<PortMonitorLoading onRetry={handleRetry} />}
        timeout={8000}
      >
        <GoipDeviceList onRefreshNeeded={fetchDevices} />
      </LoadingErrorBoundary>
    </div>
  );
};
