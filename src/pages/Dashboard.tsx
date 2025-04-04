
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CampaignProvider } from '@/contexts/campaign/CampaignContext';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { LoadingState } from '@/components/upgrade/LoadingState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { campaigns, isLoading, error, refreshCampaigns } = useCampaigns();
  const { isOnline } = useNetworkStatus();
  const [retryCount, setRetryCount] = useState(0);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  
  // Handle offline state
  useEffect(() => {
    if (!isOnline) {
      console.log("Network is offline, showing offline message");
    }
  }, [isOnline]);
  
  // Set a loading timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timer);
    } else {
      setShowTimeoutMessage(false);
    }
  }, [isLoading]);

  // Handle retry
  const handleRetry = () => {
    console.log("Manual retry triggered");
    setRetryCount(prev => prev + 1);
    setShowTimeoutMessage(false);
    refreshCampaigns();
  };
  
  // Show loading state - with timeout handling
  if (isLoading && !showTimeoutMessage) {
    return <LoadingState message="Loading dashboard..." />;
  }
  
  // Show timeout message if loading takes too long
  if (showTimeoutMessage) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <Alert variant="destructive" className="mb-6 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-4">
            <span>Loading timeout reached. The server might be busy or there could be a connection issue.</span>
            <Button 
              variant="outline" 
              onClick={handleRetry}
              className="flex items-center w-fit"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Loading
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Show network offline message
  if (!isOnline) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <Alert variant="destructive" className="mb-6 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-4">
            <span>You appear to be offline. Please check your network connection.</span>
            <Button 
              variant="outline" 
              onClick={handleRetry}
              className="flex items-center w-fit"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <Alert variant="destructive" className="mb-6 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-4">
            <span>Error loading dashboard: {error.message}</span>
            <Button 
              variant="outline" 
              onClick={handleRetry}
              className="flex items-center w-fit"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Loading
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        
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
            <CampaignProvider initialCampaigns={campaigns}>
              <CampaignTable />
            </CampaignProvider>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
