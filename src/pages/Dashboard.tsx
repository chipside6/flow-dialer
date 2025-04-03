
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CampaignProvider } from '@/contexts/campaign/CampaignContext';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { useCampaigns } from '@/hooks/useCampaigns';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { campaigns, error, isLoading, refetch } = useCampaigns();
  const { handleError } = useErrorHandler();
  const [retrying, setRetrying] = useState(false);

  // Handle errors and show toast only once
  useEffect(() => {
    if (error && !retrying) {
      handleError(error, "Error loading campaigns");
    }
  }, [error, handleError, retrying]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await refetch();
      toast({
        title: "Refreshing data",
        description: "Attempting to reconnect to the database."
      });
    } catch (err) {
      console.error("Retry failed:", err);
    } finally {
      setTimeout(() => setRetrying(false), 2000);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {error && !retrying && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Database Connection Error</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <span>There was an issue loading your data. Please check your internet connection.</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                disabled={isLoading || retrying}
                className="w-fit mt-2"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading || retrying ? 'animate-spin' : ''}`} />
                Retry Connection
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
