
import React from 'react';
import { useSubscription } from '@/hooks/subscription';
import { TrialExpiredNotice } from '@/components/campaign/TrialExpiredNotice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Campaign from './Campaign';

const CampaignsPage = () => {
  const { currentPlan } = useSubscription();
  const isLifetimePlan = currentPlan === 'lifetime';
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {isLifetimePlan ? (
          <Campaign />
        ) : (
          <TrialExpiredNotice />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CampaignsPage;
