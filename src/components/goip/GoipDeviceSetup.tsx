
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RegisterDeviceForm } from './RegisterDeviceForm';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export const GoipDeviceSetup = () => {
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
            <li>For local setups, use the detected server IP (10.0.2.15)</li>
          </ol>
        </AlertDescription>
      </Alert>
      
      <RegisterDeviceForm />
    </div>
  );
};
