
import React, { useMemo } from 'react';
import { useSubscription } from '@/hooks/subscription';
import { TrialExpiredNotice } from '@/components/campaign/TrialExpiredNotice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const CampaignsPage = () => {
  const { currentPlan } = useSubscription();
  const navigate = useNavigate();
  
  // Memoize this value to prevent recalculation on each render
  const isLifetimePlan = useMemo(() => currentPlan === 'lifetime', [currentPlan]);
  
  // Memoize this function to prevent recreation on each render
  const handleCreateCampaign = React.useCallback(() => {
    navigate('/campaign');
  }, [navigate]);
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {isLifetimePlan ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Your Campaigns</h1>
              <Button onClick={handleCreateCampaign}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
            {/* Campaign list will go here */}
            <div className="bg-muted rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                You don't have any active campaigns yet. Click the button above to create your first campaign.
              </p>
            </div>
          </div>
        ) : (
          <TrialExpiredNotice />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CampaignsPage;
