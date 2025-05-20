
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const EmptyDeviceList: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Devices</CardTitle>
        <CardDescription>No devices registered yet</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Register your first GoIP device using the form above.
        </p>
      </CardContent>
    </Card>
  );
};
