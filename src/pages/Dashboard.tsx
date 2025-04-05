
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardContent } from '@/components/layout/DashboardContent';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CampaignProvider } from '@/contexts/campaign/CampaignContext';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { campaigns, isLoading, error, refreshCampaigns } = useCampaigns();
  const { isOnline } = useNetworkStatus();
  const [retryCount, setRetryCount] = useState(0);
  
  // Handle retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refreshCampaigns();
  };
  
  return (
    <DashboardLayout>
      <div className="w-full overflow-hidden px-0 sm:px-2 py-2">
        <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Show error alert if offline or error */}
        {!isOnline && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
              <div>You appear to be offline. Please check your network connection.</div>
              <Button 
                variant="outline" 
                onClick={handleRetry}
                size="sm"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
              <div>Error loading dashboard: {error.message}</div>
              <Button 
                variant="outline" 
                onClick={handleRetry}
                size="sm"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="w-full overflow-hidden dashboard-content">
          {activeTab === "overview" && (
            <div className="w-full overflow-hidden">
              <DashboardContent>
                <div className="dashboard-overview-content">
                  {/* Dashboard overview content will be rendered inside DashboardContent */}
                </div>
              </DashboardContent>
            </div>
          )}
          
          {activeTab === "dialer" && (
            <div className="mt-2 px-2 sm:px-4">
              <h2 className="text-xl font-semibold mb-3">Quick Dialer</h2>
              <p className="text-muted-foreground text-sm">
                The quick dialer feature allows you to make calls without setting up a full campaign.
                This feature is coming soon.
              </p>
            </div>
          )}
          
          {activeTab === "campaigns" && (
            <div className="mt-2 w-full">
              <CampaignProvider initialCampaigns={campaigns || []}>
                <div className="campaign-table-container w-full">
                  <CampaignTable />
                </div>
              </CampaignProvider>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
