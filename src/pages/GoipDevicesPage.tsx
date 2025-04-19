
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GoipDeviceSetup } from '@/components/goip/GoipDeviceSetup';
import { GoipDeviceList } from '@/components/goip/GoipDeviceList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

const GoipDevicesPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Manage Your GoIP Devices</h1>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <Info className="h-5 w-5 mr-2 text-primary" />
              <CardTitle>About GoIP Integration</CardTitle>
            </div>
            <CardDescription>
              Register and manage your GoIP devices for outbound campaigns. 
              Each port can make one call at a time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our platform supports GoIP devices with 1, 2, 4, or 8 ports. Each port can be used for a 
              separate campaign, allowing you to run multiple campaigns simultaneously.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <GoipDeviceSetup />
          <GoipDeviceList />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GoipDevicesPage;
