
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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CampaignPage = () => {
  const location = useLocation();
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const { user } = useAuth();
  const { campaigns, isLoading, error, refreshCampaigns } = useCampaigns();
  const { trialExpired, currentPlan, isLoading: subscriptionLoading } = useSubscription();
  const { isOnline } = useNetworkStatus();
  const [hasAttemptedInitialLoad, setHasAttemptedInitialLoad] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const { toast } = useToast();
  
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
    try {
      // Ensure the campaign has a user_id property and matches the Campaign type
      const campaignWithRequiredFields = {
        id: newCampaign.id || uuidv4(),
        name: newCampaign.title || 'Untitled Campaign', // Add name for Campaign type
        title: newCampaign.title,
        status: (newCampaign.status as Campaign["status"]) || "draft",
        progress: newCampaign.progress || 0,
        total_calls: newCampaign.totalCalls || 0,
        answered_calls: newCampaign.answeredCalls || 0,
        transferred_calls: newCampaign.transferredCalls || 0,
        failed_calls: newCampaign.failedCalls || 0,
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        description: newCampaign.description || '',
        contact_list_id: newCampaign.contactListId || null,
        greeting_file_url: newCampaign.greetingFileId || null,
        port_number: newCampaign.portNumber || 1,
        transfer_number: newCampaign.transferNumber || null
      };
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaignWithRequiredFields)
        .select()
        .single();
      
      if (error) {
        console.error("Error creating campaign:", error);
        toast({
          title: "Error creating campaign",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully.",
        variant: "default"
      });
      
      // Refresh campaigns list to show the new campaign
      await refreshCampaigns();
      
      // Hide the wizard
      setShowCreateWizard(false);
    } catch (error: any) {
      console.error("Error in handleCreateCampaign:", error);
      toast({
        title: "Error creating campaign",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
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
                  <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold">Campaigns</h1>
                    <Button 
                      variant="success"
                      onClick={() => setShowCreateWizard(true)}
                      className="whitespace-nowrap"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Button>
                  </div>
                  <div className="w-full overflow-hidden">
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
