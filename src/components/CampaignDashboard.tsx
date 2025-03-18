
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Campaign } from "@/hooks/useCampaigns";
import { CampaignTable } from "@/components/campaigns/CampaignTable";
import { CampaignDetails } from "@/components/campaigns/CampaignDetails";
import { CampaignStats } from "@/components/campaigns/CampaignStats";
import { CampaignProvider, useCampaignContext } from "@/contexts/campaign/CampaignContext";

interface CampaignDashboardProps {
  initialCampaigns?: Campaign[];
}

// Inner component that uses the context
const CampaignDashboardContent = () => {
  const { selectedCampaign } = useCampaignContext();

  return (
    <div className="space-y-6 overflow-x-hidden">
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/40">
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="table-container">
            <CampaignTable />
          </div>
        </CardContent>
      </Card>

      {selectedCampaign && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-x-hidden">
          <CampaignDetails campaign={selectedCampaign} />
          <CampaignStats campaign={selectedCampaign} />
        </div>
      )}
    </div>
  );
};

// Wrapper component that provides the context
const CampaignDashboard = ({ initialCampaigns = [] }: CampaignDashboardProps) => {
  return (
    <CampaignProvider initialCampaigns={initialCampaigns}>
      <CampaignDashboardContent />
    </CampaignProvider>
  );
};

export default CampaignDashboard;
