
import React from 'react';
import { useSubscription } from '@/hooks/subscription';
import { TrialExpiredNotice } from '@/components/campaign/TrialExpiredNotice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CampaignCreationWizard } from '@/components/campaign-wizard/CampaignCreationWizard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const Campaign = () => {
  const { currentPlan } = useSubscription();
  const isLifetimePlan = currentPlan === 'lifetime';
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Event handlers for the CampaignCreationWizard
  const handleComplete = (campaignData: any) => {
    console.log('Campaign created:', campaignData);
    toast({
      title: "Campaign created",
      description: "Your campaign has been created successfully."
    });
    navigate('/campaigns');
  };
  
  const handleCancel = () => {
    console.log('Campaign creation cancelled');
    navigate('/campaigns');
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
