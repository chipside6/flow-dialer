
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UpgradeContainer } from '@/components/upgrade/UpgradeContainer';

const UpgradePage = () => {
  return (
    <DashboardLayout>
      <UpgradeContainer />
    </DashboardLayout>
  );
};

export default UpgradePage;
