
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CampaignProvider } from '@/contexts/campaign/CampaignContext';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { useCampaigns } from '@/hooks/useCampaigns';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { campaigns } = useCampaigns();

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
