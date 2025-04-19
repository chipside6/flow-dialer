
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { GoipDeviceForm } from './GoipDeviceForm';

export const GoipDeviceSetup = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Register New Device</CardTitle>
        <CardDescription>Add a new GoIP device to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <GoipDeviceForm />
      </CardContent>
    </Card>
  );
};
