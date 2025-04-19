
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { GoipDeviceForm } from './GoipDeviceForm';

export const GoipDeviceSetup = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Register New Device</CardTitle>
        <CardDescription>Add your GoIP device to connect it with our platform</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your GoIP device details below. Once registered, you can manage your device 
          and its ports from the Devices page.
        </p>
        <GoipDeviceForm />
      </CardContent>
    </Card>
  );
};
