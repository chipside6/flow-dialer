
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
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
      <div className="container mx-auto px-4 py-6">
        <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Show error alert if offline or error */}
        {!isOnline && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>You appear to be offline. Please check your network connection.</div>
              <Button 
                variant="outline" 
                onClick={handleRetry}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>Error loading dashboard: {error.message}</div>
              <Button 
                variant="outline" 
                onClick={handleRetry}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {activeTab === "overview" && (
          <DashboardContent />
        )}
        
        {activeTab === "dialer" && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Quick Dialer</h2>
            <p className="text-muted-foreground">
              The quick dialer feature allows you to make calls without setting up a full campaign.
              This feature is coming soon.
            </p>
          </div>
        )}
        
        {activeTab === "campaigns" && (
          <div className="mt-6">
            <CampaignProvider initialCampaigns={campaigns || []}>
              <CampaignTable />
            </CampaignProvider>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
