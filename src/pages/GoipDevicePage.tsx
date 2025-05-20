
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { GoipHeader } from '@/components/goip/GoipHeader';
import { GoipDeviceForm } from '@/components/goip/GoipDeviceForm';
import { GoipDeviceList } from '@/components/goip/GoipDeviceList';
import { Info } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { WorkflowInstructions } from '@/components/goip/WorkflowInstructions';

const GoipDevicePage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <GoipHeader />
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <Info className="h-5 w-5 mr-2 text-primary" />
              <CardTitle>About GoIP Configuration</CardTitle>
            </div>
            <CardDescription>
              Register your GoIP device with our auto-generated SIP credentials.
              Each device can have multiple ports for making simultaneous calls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our platform supports GoIP devices with 1, 2, 4, or 8 ports. After registration,
              you'll see your devices listed below with their port information and status.
            </p>
          </CardContent>
        </Card>
        
        <div className="grid gap-6">
          {/* Use the refactored GoIP device form */}
          <GoipDeviceForm />
          
          {/* Show registered devices */}
          <GoipDeviceList />
          
          {/* Setup instructions */}
          <WorkflowInstructions />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GoipDevicePage;
