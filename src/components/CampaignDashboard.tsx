
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCampaignSimulation } from "@/hooks/useCampaignSimulation";
import { CampaignTable } from "@/components/campaigns/CampaignTable";
import { CampaignDetails } from "@/components/campaigns/CampaignDetails";
import { CampaignStats } from "@/components/campaigns/CampaignStats";
import { Campaign } from "@/hooks/useCampaigns";

interface CampaignDashboardProps {
  initialCampaigns?: Campaign[];
}

const CampaignDashboard = ({ initialCampaigns = [] }: CampaignDashboardProps) => {
  const {
    campaigns,
    selectedCampaign,
    setSelectedCampaign,
    startCampaign,
    pauseCampaign
  } = useCampaignSimulation(initialCampaigns);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-muted/40">
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CampaignTable 
            campaigns={campaigns}
            onSelectCampaign={setSelectedCampaign}
            onStartCampaign={startCampaign}
            onPauseCampaign={pauseCampaign}
          />
        </CardContent>
      </Card>

      {selectedCampaign && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CampaignDetails 
            campaign={selectedCampaign}
            onStartCampaign={startCampaign}
            onPauseCampaign={pauseCampaign}
          />
          <CampaignStats campaign={selectedCampaign} />
        </div>
      )}
    </div>
  );
};

export default CampaignDashboard;
