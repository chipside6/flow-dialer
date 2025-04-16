
import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/subscription';
import { TrialExpiredNotice } from '@/components/campaign/TrialExpiredNotice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CampaignCreationWizard } from '@/components/campaign-wizard/CampaignCreationWizard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useLoadingStateManager } from '@/hooks/useLoadingStateManager';

const Campaign = () => {
  const { currentPlan, isLoading: isSubscriptionLoading } = useSubscription();
  const isLifetimePlan = currentPlan === 'lifetime';
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use our loading state manager with timeout fallback
  const { isLoading: isCheckingSubscription, setIsLoading } = useLoadingStateManager({
    initialState: true,
    timeout: 5000, // 5 second timeout
    onTimeout: () => {
      console.warn("Subscription check timed out, showing available content");
    }
  });
  
  // Effect to prevent flash of content by ensuring subscription check is complete
  useEffect(() => {
    if (!isSubscriptionLoading) {
      setIsLoading(false);
    }
  }, [isSubscriptionLoading, setIsLoading]);
  
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
        {isCheckingSubscription ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : isLifetimePlan ? (
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
