
import React, { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { SimpleGoipRegisterForm } from './SimpleGoipRegisterForm';
import { GoipDeviceList } from './GoipDeviceList';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent } from '@/components/ui/card';

export const GoipDeviceSetup = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">GoIP Setup Guide</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          Enter your device name, IP address, and number of ports to register your GoIP device.
          After registration, you'll be able to use your device in campaigns.
        </AlertDescription>
      </Alert>
      
      <div className="grid md:grid-cols-2 gap-4">
        <SimpleGoipRegisterForm onSuccess={triggerRefresh} />
        
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
    </div>
  );
};
