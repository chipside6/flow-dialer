
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
import CampaignDashboard from '@/components/CampaignDashboard';

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
      <div className="w-full h-full flex flex-col overflow-hidden">
        <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Show error alert if offline or error */}
        {!isOnline && (
          <Alert variant="destructive" className="mb-4 mx-4">
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
          <Alert variant="destructive" className="mb-4 mx-4">
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
                <div className="dashboard-overview-content py-4 space-y-6">
                  <h2 className="text-xl font-semibold">Campaign Analytics</h2>
                  <p className="text-muted-foreground">
                    Welcome to your campaign dashboard. Here you can view analytics and manage your campaigns.
                  </p>
                  
                  {/* Display some sample campaign stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-primary/10 rounded-lg p-4">
                      <h3 className="font-medium">Active Campaigns</h3>
                      <p className="text-2xl font-bold mt-2">{campaigns?.length || 0}</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-4">
                      <h3 className="font-medium">Completed Calls</h3>
                      <p className="text-2xl font-bold mt-2">0</p>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-4">
                      <h3 className="font-medium">Success Rate</h3>
                      <p className="text-2xl font-bold mt-2">0%</p>
                    </div>
                  </div>
                  
                  {/* Recent Campaigns Section */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Campaigns</h3>
                    {(campaigns && campaigns.length > 0) ? (
                      <CampaignDashboard 
                        initialCampaigns={campaigns.slice(0, 3) || []} 
                        onRefresh={refreshCampaigns}
                      />
                    ) : (
                      <div className="border rounded-lg p-6 text-center bg-gray-50">
                        <p className="text-muted-foreground mb-4">You haven't created any campaigns yet</p>
                        <Button 
                          variant="success" 
                          onClick={() => window.location.href = '/campaign'}
                        >
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
                <div className="max-w-4xl mx-auto p-4">
                  <h2 className="text-xl font-semibold mb-3">Quick Dialer</h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    The quick dialer feature allows you to make calls without setting up a full campaign.
                    This feature is coming soon.
                  </p>
                  
                  {/* Placeholder for quick dialer UI */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">Quick dialer functionality will be available soon</p>
                    <Button className="mt-4" disabled>Start Quick Call</Button>
                  </div>
                </div>
              </DashboardContent>
            </div>
          )}
          
          {activeTab === "campaigns" && (
            <div className="w-full h-full overflow-auto">
              <DashboardContent>
                <CampaignProvider initialCampaigns={campaigns || []}>
                  <div className="campaign-table-container w-full p-4">
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
