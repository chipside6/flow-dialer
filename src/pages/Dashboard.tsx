
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { OverviewTab } from '@/components/dashboard/OverviewTab';
import { DialerTab } from '@/components/dashboard/DialerTab';
import { CampaignsTab } from '@/components/dashboard/CampaignsTab';
import { NetworkErrorDisplay } from '@/components/dashboard/NetworkErrorDisplay';
import { AuthenticationRequired } from '@/components/dashboard/AuthenticationRequired';
import { TabsContent } from '@/components/ui/tabs';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { useDashboard } from '@/hooks/dashboard/useDashboard';

const Dashboard = () => {
  const {
    activeTab,
    setActiveTab,
    campaigns,
    isLoading,
    error,
    isOnline,
    isAuthenticated,
    handleRetry,
    handleCreateCampaign,
    handleRefreshCampaigns
  } = useDashboard();
  
  // Check authentication status
  if (!isAuthenticated && !isLoading) {
    return <AuthenticationRequired />;
  }
  
  return (
    <DashboardLayout>
      <div className="w-full h-full flex flex-col overflow-hidden">
        <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Show error alert if offline or error */}
        <NetworkErrorDisplay 
          isOnline={isOnline}
          error={error}
          onRetry={handleRetry}
        />

        <div className="w-full flex-1 overflow-hidden dashboard-content">
          <DashboardTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
          >
            <TabsContent value="overview" className="h-full overflow-auto">
              <OverviewTab 
                campaigns={campaigns}
                isLoading={isLoading}
                handleCreateCampaign={handleCreateCampaign}
                handleRefreshCampaigns={handleRefreshCampaigns}
              />
            </TabsContent>
            
            <TabsContent value="dialer" className="h-full overflow-auto">
              <DialerTab />
            </TabsContent>
            
            <TabsContent value="campaigns" className="h-full overflow-auto">
              <CampaignsTab 
                campaigns={campaigns}
                isLoading={isLoading}
                handleCreateCampaign={handleCreateCampaign}
              />
            </TabsContent>
          </DashboardTabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
