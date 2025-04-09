
import React from 'react';
import { useSubscription } from '@/hooks/subscription';
import { TrialExpiredNotice } from '@/components/campaign/TrialExpiredNotice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CampaignCreationWizard } from '@/components/campaign-wizard/CampaignCreationWizard';
import ProtectedRoute from '@/components/ProtectedRoute';

const Campaign = () => {
  const { currentPlan } = useSubscription();
  const isLifetimePlan = currentPlan === 'lifetime';
  
  // Event handlers for the CampaignCreationWizard
  const handleComplete = (campaignData: any) => {
    console.log('Campaign created:', campaignData);
    // Additional logic for handling campaign creation
  };
  
  const handleCancel = () => {
    console.log('Campaign creation cancelled');
    // Additional logic for handling cancellation
  };
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {isLifetimePlan ? (
          <CampaignCreationWizard 
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        ) : (
          <TrialExpiredNotice />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Campaign;
