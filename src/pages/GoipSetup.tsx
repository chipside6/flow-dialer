
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { Info } from 'lucide-react';
import { GoipDeviceSetup } from '@/components/goip/GoipDeviceSetup';
import ProtectedRoute from '@/components/ProtectedRoute';

const GoipSetupContent = () => {
  const { user } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">GoIP Setup Instructions</h1>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <Info className="h-5 w-5 mr-2 text-primary" />
              <CardTitle>About GoIP Configuration</CardTitle>
            </div>
            <CardDescription>
              Connect your GoIP device to our platform for outbound campaigns.
              Follow the instructions below to set up your device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our platform supports GoIP devices with 1, 2, 4, or 8 ports. Register your device
              and configure each port to connect with our system.
            </p>
          </CardContent>
        </Card>
        
        <div className="grid gap-6">
          {/* Device Registration Form */}
          <GoipDeviceSetup />
        </div>
      </div>
    </DashboardLayout>
  );
};

const GoipSetup = () => {
  return (
    <ProtectedRoute>
      <GoipSetupContent />
    </ProtectedRoute>
  );
};

export default GoipSetup;
