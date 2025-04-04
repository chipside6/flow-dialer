
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { Campaign } from "@/types/campaign";
import { useCampaignContext } from "@/contexts/campaign/CampaignContext";

interface CampaignDetailsProps {
  campaign: Campaign;
}

export const CampaignDetails: React.FC<CampaignDetailsProps> = ({
  campaign
}) => {
  const { startCampaign, pauseCampaign } = useCampaignContext();

  return (
    <Card>
      <CardHeader className="bg-muted/40">
        <CardTitle className="text-lg">Campaign Details: {campaign.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium capitalize">{campaign.status}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Progress</p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={campaign.progress} className="h-2 flex-1" />
              <span>{campaign.progress}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Campaign ID</p>
            <p className="font-mono text-sm">{campaign.id}</p>
          </div>
          <div className="pt-2">
            {campaign.status === "running" ? (
              <Button variant="outline" onClick={() => pauseCampaign(campaign.id)}>
                <Pause className="h-4 w-4 mr-2" /> Pause Campaign
              </Button>
            ) : (campaign.status === "paused" || campaign.status === "pending" || campaign.status === "draft") ? (
              <Button variant="default" onClick={() => startCampaign(campaign.id)}>
                <Play className="h-4 w-4 mr-2" /> Start Campaign
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
