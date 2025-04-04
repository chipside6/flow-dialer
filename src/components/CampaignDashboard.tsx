
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Campaign } from "@/hooks/useCampaigns";
import { CampaignTable } from "@/components/campaigns/CampaignTable";
import { CampaignDetails } from "@/components/campaigns/CampaignDetails";
import { CampaignStats } from "@/components/campaigns/CampaignStats";
import { CampaignProvider, useCampaignContext } from "@/contexts/campaign/CampaignContext";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6 w-full">
      <Card className="w-full">
        <CardHeader className="bg-muted/40">
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <CampaignTable />
          </div>
        </CardContent>
      </Card>

      {selectedCampaign && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
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
