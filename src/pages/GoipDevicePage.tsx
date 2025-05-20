
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { GoipDeviceList } from '@/components/goip/GoipDeviceList';
import { RegisterDeviceForm } from '@/components/goip/RegisterDeviceForm';
import { PortMonitor } from '@/components/goip/PortMonitor';
import { useAuth } from '@/contexts/auth';

const GoipDevicePage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">GoIP Device Management</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <RegisterDeviceForm />
            <GoipDeviceList />
          </div>
          <div>
            <PortMonitor userId={user?.id} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GoipDevicePage;
