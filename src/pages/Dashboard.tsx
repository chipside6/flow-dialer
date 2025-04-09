
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardContent } from '@/components/layout/DashboardContent';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CampaignProvider } from '@/contexts/campaign/CampaignContext';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CampaignDashboard from '@/components/CampaignDashboard';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { campaigns, isLoading, error, refreshCampaigns } = useCampaigns();
  const { isOnline } = useNetworkStatus();
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Log campaigns to debug
  useEffect(() => {
    console.log("Dashboard campaigns:", campaigns);
  }, [campaigns]);
  
  // Handle retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refreshCampaigns();
  };
  
  const handleCreateCampaign = () => {
    navigate('/campaign', { state: { showCreateWizard: true } });
  };
  
  // Add a refresh function explicitly for the dashboard
  const handleRefreshCampaigns = async () => {
    try {
      const success = await refreshCampaigns();
      if (success) {
        toast({
          title: "Campaigns refreshed",
          description: "Your campaign list has been updated."
        });
      }
    } catch (error) {
      console.error("Error refreshing campaigns:", error);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="w-full h-full flex flex-col overflow-hidden">
        <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Show error alert if offline or error */}
        {!isOnline && (
          <Alert variant="destructive" className="mb-4 mx-auto max-w-lg">
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
          <Alert variant="destructive" className="mb-4 mx-auto max-w-lg">
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

        <div className="w-full flex-1 overflow-hidden dashboard-content">
          {activeTab === "overview" && (
            <div className="w-full h-full overflow-auto">
              <DashboardContent>
                <div className="dashboard-overview-content py-4 space-y-6 mx-auto text-center">
                  <h2 className="text-xl font-semibold text-center">Campaign Analytics</h2>
                  <p className="text-muted-foreground text-center">
                    Welcome to your campaign dashboard. Here you can view analytics and manage your campaigns.
                  </p>
                  
                  {/* Display some sample campaign stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mx-auto">
                    <div className="bg-primary/10 rounded-lg p-4">
                      <h3 className="font-medium">Active Campaigns</h3>
                      <p className="text-2xl font-bold mt-2">{campaigns?.filter(c => c.status === 'running').length || 0}</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-4">
                      <h3 className="font-medium">Completed Calls</h3>
                      <p className="text-2xl font-bold mt-2">
                        {campaigns?.reduce((sum, c) => sum + (c.answeredCalls || 0), 0) || 0}
                      </p>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-4">
                      <h3 className="font-medium">Success Rate</h3>
                      <p className="text-2xl font-bold mt-2">
                        {(() => {
                          const totalCalls = campaigns?.reduce((sum, c) => sum + (c.totalCalls || 0), 0) || 0;
                          const answered = campaigns?.reduce((sum, c) => sum + (c.answeredCalls || 0), 0) || 0;
                          return totalCalls > 0 ? `${Math.round((answered / totalCalls) * 100)}%` : '0%';
                        })()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Create Campaign Button */}
                  <div className="flex justify-center my-6">
                    <Button 
                      variant="success" 
                      onClick={handleCreateCampaign}
                      className="w-auto px-6 py-2 h-auto"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Button>
                  </div>
                  
                  {/* Recent Campaigns Section with refresh button */}
                  <div className="mt-6 w-full text-center">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-center">Recent Campaigns</h3>
                      <Button 
                        variant="outline" 
                        onClick={handleRefreshCampaigns}
                        size="sm"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                    </div>
                    
                    {isLoading ? (
                      <div className="border rounded-lg p-6 text-center bg-gray-50 mx-auto max-w-lg">
                        <p className="text-muted-foreground mb-4 text-center">Loading campaigns...</p>
                      </div>
                    ) : (campaigns && campaigns.length > 0) ? (
                      <CampaignDashboard 
                        initialCampaigns={campaigns.slice(0, 3)} 
                        onRefresh={handleRefreshCampaigns}
                      />
                    ) : (
                      <div className="border rounded-lg p-6 text-center bg-gray-50 mx-auto max-w-lg">
                        <p className="text-muted-foreground mb-4 text-center">You haven't created any campaigns yet</p>
                        <Button 
                          variant="success" 
                          onClick={handleCreateCampaign}
                          className="mx-auto w-auto px-6"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Your First Campaign
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </DashboardContent>
            </div>
          )}
          
          {activeTab === "dialer" && (
            <div className="w-full h-full overflow-auto">
              <DashboardContent>
                <div className="max-w-4xl mx-auto p-4 text-center">
                  <h2 className="text-xl font-semibold mb-3 text-center">Quick Dialer</h2>
                  <p className="text-muted-foreground text-sm mb-6 text-center">
                    The quick dialer feature allows you to make calls without setting up a full campaign.
                    This feature is coming soon.
                  </p>
                  
                  {/* Placeholder for quick dialer UI */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mx-auto max-w-md">
                    <p className="text-muted-foreground text-center">Quick dialer functionality will be available soon</p>
                    <Button className="mt-4 mx-auto" disabled>Start Quick Call</Button>
                  </div>
                </div>
              </DashboardContent>
            </div>
          )}
          
          {activeTab === "campaigns" && (
            <div className="w-full h-full overflow-auto">
              <DashboardContent>
                {/* Add create campaign button at the top */}
                <div className="flex justify-center mb-4 pt-4">
                  <Button 
                    variant="success" 
                    onClick={handleCreateCampaign}
                    className="w-auto px-6 py-2 h-auto"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </div>
                
                <CampaignProvider initialCampaigns={campaigns || []}>
                  <div className="campaign-table-container w-full p-4 mx-auto">
                    <CampaignTable />
                  </div>
                </CampaignProvider>
              </DashboardContent>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
