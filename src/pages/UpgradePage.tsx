
import React from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import { UpgradeContainer } from '@/components/upgrade/UpgradeContainer';

const UpgradePage = () => {
  return (
    <PublicLayout>
      <div className="container mx-auto py-8">
        <UpgradeContainer />
      </div>
    </PublicLayout>
  );
};

export default UpgradePage;
