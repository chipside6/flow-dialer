
import React, { useEffect, useState } from 'react';
import { useSubscription } from '@/hooks/subscription';
import { TrialExpiredNotice } from '@/components/campaign/TrialExpiredNotice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useCampaigns } from '@/hooks/campaigns/useCampaigns';

const CampaignsPage = () => {
  const { hasLifetimePlan } = useSubscription();
  const navigate = useNavigate();
  const { campaigns, isLoading, refreshCampaigns } = useCampaigns();
  const [hasChecked, setHasChecked] = useState(false);
  
  // Initial data load on component mount - only run once
  useEffect(() => {
    if (!hasChecked) {
      refreshCampaigns().then(() => {
        setHasChecked(true);
      });
    }
  }, [refreshCampaigns, hasChecked]);
  
  const handleCreateCampaign = () => {
    navigate('/campaign');
  };
  
  return (
    <ProtectedRoute requireSubscription={true}>
      <DashboardLayout>
        {hasLifetimePlan ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Your Campaigns</h1>
              <Button onClick={handleCreateCampaign}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
            
            {isLoading && !hasChecked ? (
              <div className="bg-muted rounded-lg p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="grid gap-4">
                {/* Campaign list would go here */}
                <p className="text-muted-foreground">
                  {campaigns.length} active campaign(s)
                </p>
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-8 text-center">
                <p className="text-muted-foreground">
                  You don't have any active campaigns yet. Click the button above to create your first campaign.
                </p>
              </div>
            )}
          </div>
        ) : (
          <TrialExpiredNotice />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CampaignsPage;
