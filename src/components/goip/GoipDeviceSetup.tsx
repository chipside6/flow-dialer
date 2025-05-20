
import React, { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { RegisterDeviceForm } from './RegisterDeviceForm';
import { GoipDeviceList } from './GoipDeviceList';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

export const GoipDeviceSetup = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Log authentication status for debugging
  React.useEffect(() => {
    if (user) {
      logger.info("User authenticated in GoipDeviceSetup:", user.id);
      console.log("User authenticated in GoipDeviceSetup:", user?.id);
    } else {
      logger.warn("No user authenticated in GoipDeviceSetup");
      console.log("No user authenticated in GoipDeviceSetup");
    }
  }, [user]);
  
  const triggerRefresh = () => {
    logger.info("Manual refresh triggered");
    console.log("Manual refresh triggered");
    setRefreshTrigger(prev => prev + 1);
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
      
      <RegisterDeviceForm onSuccess={triggerRefresh} />
      
      {!user ? (
        <Card>
          <CardContent className="flex items-center justify-center py-6">
            <p>Please log in to view your devices</p>
          </CardContent>
        </Card>
      ) : (
        <GoipDeviceList key={refreshTrigger} onRefreshNeeded={triggerRefresh} />
      )}
    </div>
  );
};
