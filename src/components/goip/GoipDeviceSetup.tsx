
import React, { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { SimpleGoipRegisterForm } from './SimpleGoipRegisterForm';
import { GoipDeviceList } from './GoipDeviceList';
import { useAuth } from '@/contexts/auth';

export const GoipDeviceSetup = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">GoIP Device Registration</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          Enter your device details below to register a new GoIP device. After registration, 
          the device will appear in your available devices list.
        </AlertDescription>
      </Alert>
      
      <div className="grid md:grid-cols-1 gap-6">
        <SimpleGoipRegisterForm onSuccess={triggerRefresh} />
        <GoipDeviceList key={refreshTrigger} onRefreshNeeded={triggerRefresh} />
      </div>
    </div>
  );
};
