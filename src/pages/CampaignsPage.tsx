
import React from 'react';
import Campaign from './Campaign';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const CampaignsPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Campaign />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CampaignsPage;
