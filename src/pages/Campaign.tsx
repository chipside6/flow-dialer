
import React from 'react';
import { useSubscription } from '@/hooks/subscription';
import { TrialExpiredNotice } from '@/components/campaign/TrialExpiredNotice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CampaignWizard } from '@/components/campaign-wizard/CampaignWizard';
import ProtectedRoute from '@/components/ProtectedRoute';

const Campaign = () => {
  const { currentPlan } = useSubscription();
  const isLifetimePlan = currentPlan === 'lifetime';
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {isLifetimePlan ? (
          <CampaignWizard />
        ) : (
          <TrialExpiredNotice />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Campaign;
