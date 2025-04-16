
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GoipDeviceSetup } from '@/components/goip/GoipDeviceSetup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

const GoipDevicesPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">GoIP Device Management</h1>
          
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary" />
                <CardTitle>About GoIP Integration</CardTitle>
              </div>
              <CardDescription>
                GoIP devices let you make outbound calls using regular phone lines or GSM networks.
                Register your devices here to use them with our autodialer system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our platform supports GoIP devices with 1, 2, 4, or 8 ports. Each port can be used for a 
                separate campaign, allowing you to run multiple campaigns simultaneously.
              </p>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="register">
            <TabsList className="mb-6">
              <TabsTrigger value="register">Register Device</TabsTrigger>
              <TabsTrigger value="manage">Manage Devices</TabsTrigger>
            </TabsList>
            
            <TabsContent value="register">
              <GoipDeviceSetup />
            </TabsContent>
            
            <TabsContent value="manage">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Your Devices</CardTitle>
                  <CardDescription>
                    View, update, or delete your registered GoIP devices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This feature is coming soon. For now, you can register new devices
                    which will replace any existing devices with the same name.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default GoipDevicesPage;
