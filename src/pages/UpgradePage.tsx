
import React from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import { UpgradeContainer } from '@/components/upgrade/UpgradeContainer';
import { SubscriptionCheck } from '@/components/SubscriptionCheck';

const UpgradePage = () => {
  return (
    <PublicLayout>
      <SubscriptionCheck redirectTo="/dashboard" requireSubscription={false}>
        <UpgradeContainer />
      </SubscriptionCheck>
    </PublicLayout>
  );
};

export default UpgradePage;
