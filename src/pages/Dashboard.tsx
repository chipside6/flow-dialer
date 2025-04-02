
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <DashboardHeader />
        <DashboardContent />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
