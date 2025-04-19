
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GoipDeviceRegistration } from '@/components/goip/GoipDeviceRegistration';
import { RegisteredDevicesList } from '@/components/goip/RegisteredDevicesList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Server, Info } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const GoipDevicesPage = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const refreshDevicesList = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('devices');
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center mb-6">
            <Server className="h-6 w-6 mr-2 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Manage Your GoIP Devices</h1>
              <p className="text-muted-foreground">
                Register and manage your GoIP devices for outbound campaigns. Each port can make one call at a time.
              </p>
            </div>
          </div>
          
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary" />
                <CardTitle>About GoIP Integration</CardTitle>
              </div>
              <CardDescription>
                GoIP devices allow you to make outbound calls using regular phone lines or GSM networks.
                Register your devices here to use them with our autodialer system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                After registration, you'll receive SIP credentials for each port on your device. 
                Configure these credentials in your GoIP device to connect it with our system.
              </p>
            </CardContent>
          </Card>
          
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="register">Register Device</TabsTrigger>
              <TabsTrigger value="devices">Manage Devices</TabsTrigger>
            </TabsList>
            
            <TabsContent value="register">
              <GoipDeviceRegistration onDeviceRegistered={refreshDevicesList} />
            </TabsContent>
            
            <TabsContent value="devices">
              <RegisteredDevicesList refreshTrigger={refreshTrigger} />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default GoipDevicesPage;
