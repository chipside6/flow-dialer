
import React from 'react';
import { DashboardContent } from '@/components/layout/DashboardContent';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Campaign } from '@/types/campaign';
import { useNavigate } from 'react-router-dom';
import CampaignDashboard from '@/components/CampaignDashboard';

interface OverviewTabProps {
  campaigns: Campaign[];
  isLoading: boolean;
  handleCreateCampaign: () => void;
  handleRefreshCampaigns: () => void;
}

export const OverviewTab = ({ 
  campaigns, 
  isLoading, 
  handleCreateCampaign, 
  handleRefreshCampaigns 
}: OverviewTabProps) => {
  const navigate = useNavigate();

  return (
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
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Refresh
            </Button>
          </div>
          
          {isLoading && campaigns.length === 0 ? (
            <div className="border rounded-lg p-6 text-center bg-gray-50 mx-auto max-w-lg">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground mb-2">Loading campaigns...</p>
                <p className="text-xs text-muted-foreground">This may take a moment</p>
              </div>
            </div>
          ) : (campaigns && campaigns.length > 0) ? (
            <CampaignDashboard 
              initialCampaigns={campaigns.slice(0, 3) || []} 
              onRefresh={handleRefreshCampaigns}
              isLoading={isLoading}
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
  );
};
