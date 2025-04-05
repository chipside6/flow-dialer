
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Campaign } from "@/hooks/useCampaigns";
import { CampaignTable } from "@/components/campaigns/CampaignTable";
import { CampaignDetails } from "@/components/campaigns/CampaignDetails";
import { CampaignStats } from "@/components/campaigns/CampaignStats";
import { CampaignProvider, useCampaignContext } from "@/contexts/campaign/CampaignContext";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface CampaignDashboardProps {
  initialCampaigns?: Campaign[];
  onRefresh?: () => void;
}

// Inner component that uses the context
const CampaignDashboardContent = ({ onRefresh }: { onRefresh?: () => void }) => {
  const { selectedCampaign } = useCampaignContext();
  const { isOnline } = useNetworkStatus();

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden campaign-dashboard">
      <Card className="w-full overflow-hidden">
        <CardHeader className="bg-muted/40 px-4 py-3">
          <CardTitle className="text-base md:text-lg">Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          <div className="w-full overflow-x-auto campaign-table-container">
            <CampaignTable />
          </div>
        </CardContent>
      </Card>

      {selectedCampaign && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-full overflow-hidden">
          <CampaignDetails campaign={selectedCampaign} />
          <CampaignStats campaign={selectedCampaign} />
        </div>
      )}
    </div>
  );
};

// Wrapper component that provides the context
const CampaignDashboard = ({ initialCampaigns = [], onRefresh }: CampaignDashboardProps) => {
  return (
    <CampaignProvider initialCampaigns={initialCampaigns}>
      <CampaignDashboardContent onRefresh={onRefresh} />
    </CampaignProvider>
  );
};

export default CampaignDashboard;
