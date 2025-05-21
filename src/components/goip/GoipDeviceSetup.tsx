
import React, { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { SimpleGoipRegisterForm } from './SimpleGoipRegisterForm';
import { GoipDeviceList } from './GoipDeviceList';
import { PortStatusMonitor } from './PortStatusMonitor';
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
        <AlertTitle className="text-blue-800 dark:text-blue-300">GoIP Device Management</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          Register your GoIP devices and monitor their port status. Each port represents one line that can make a call.
          Active campaigns require available ports to function properly.
        </AlertDescription>
      </Alert>
      
      <div className="grid md:grid-cols-1 gap-6">
        <SimpleGoipRegisterForm onSuccess={triggerRefresh} />
        <GoipDeviceList key={refreshTrigger} onRefreshNeeded={triggerRefresh} />
        <PortStatusMonitor onPortUpdated={triggerRefresh} />
      </div>
    </div>
  );
};
