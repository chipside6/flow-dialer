
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CampaignDashboard from "@/components/CampaignDashboard";
import { CampaignCreationWizard } from "@/components/campaign-wizard/CampaignCreationWizard";
import { PlusCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CampaignData } from "@/components/campaign-wizard/types";
import { useAuth } from "@/contexts/auth/useAuth";
import { Campaign } from "@/types/campaign";
import { v4 as uuidv4 } from 'uuid';
import { useLocation } from "react-router-dom";
import { useCampaigns } from "@/hooks/useCampaigns";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useSubscription } from "@/hooks/subscription";
import { TrialExpiredNotice } from "@/components/campaign/TrialExpiredNotice";
import { LoadingState } from "@/components/upgrade/LoadingState";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const CampaignPage = () => {
  const location = useLocation();
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const { user } = useAuth();
  const { campaigns, isLoading, error, refreshCampaigns } = useCampaigns();
  const { trialExpired, currentPlan, isLoading: subscriptionLoading } = useSubscription();
  const { isOnline } = useNetworkStatus();
  const [hasAttemptedInitialLoad, setHasAttemptedInitialLoad] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  
  // Check if user can create campaigns based on subscription status
  const canAccessCampaigns = currentPlan === 'lifetime' || 
                             (currentPlan === 'trial' && !trialExpired);
  
  // Check for state passed from navigation to determine if we should show the wizard
  useEffect(() => {
    if (location.state && location.state.showCreateWizard) {
      setShowCreateWizard(true);
      // Clean up the state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  // Mark when subscription check is complete to prevent UI flashing
  useEffect(() => {
    if (!subscriptionLoading) {
      setSubscriptionChecked(true);
    }
  }, [subscriptionLoading]);
  
  // Mark when first load attempt has occurred
  useEffect(() => {
    if (isLoading) {
      setHasAttemptedInitialLoad(true);
    }
  }, [isLoading]);
  
  const handleCreateCampaign = async (newCampaign: CampaignData) => {
    // Ensure the campaign has a user_id property and matches the Campaign type
    const campaignWithRequiredFields: Campaign = {
      id: newCampaign.id || uuidv4(),
      name: newCampaign.title || 'Untitled Campaign', // Add name for Campaign type
      title: newCampaign.title,
      status: (newCampaign.status as Campaign["status"]) || "draft",
      progress: newCampaign.progress || 0,
      totalCalls: newCampaign.totalCalls || 0,
      answeredCalls: newCampaign.answeredCalls || 0,
      transferredCalls: newCampaign.transferredCalls || 0,
      failedCalls: newCampaign.failedCalls || 0,
      user_id: user?.id || '',
      created_at: new Date().toISOString() // Add created_at for Campaign type
    };
    
    setShowCreateWizard(false);
  };
  
  // Only show loading state for initial load, not for subsequent refreshes
  if ((isLoading && campaigns.length === 0 && !hasAttemptedInitialLoad) || !subscriptionChecked) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto w-full px-4 pt-8">
          <LoadingState 
            message="Loading your campaigns..." 
            onRetry={refreshCampaigns}
            timeout={10000} // Longer timeout to prevent flickering
            showTimeoutError={false} // Don't show timeout errors on initial load
          />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SidebarProvider>
        <div className="flex flex-1 w-full">
          <DashboardLayout>
            <div className="max-w-6xl mx-auto w-full px-2 md:px-4 pt-4 campaign-content">
              {!canAccessCampaigns && subscriptionChecked ? (
                <TrialExpiredNotice />
              ) : showCreateWizard ? (
                <CampaignCreationWizard 
                  onComplete={handleCreateCampaign}
                  onCancel={() => setShowCreateWizard(false)}
                />
              ) : (
                <>
                  <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold">Campaigns</h1>
                    <div className="flex gap-2">
                      <Button 
                        variant="success"
                        onClick={() => setShowCreateWizard(true)}
                        className="whitespace-nowrap"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Campaign
                      </Button>
                    </div>
                  </div>
                  <div className="w-full">
                    <CampaignDashboard initialCampaigns={campaigns} />
                  </div>
                </>
              )}
            </div>
          </DashboardLayout>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default CampaignPage;
