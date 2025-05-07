
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const SettingsPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p>Configure your account settings here.</p>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
