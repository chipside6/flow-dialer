
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PhoneCall, Phone, PhoneForwarded, PhoneOff } from "lucide-react";
import { Campaign } from "@/hooks/useCampaigns";

interface CampaignStatsProps {
  campaign: Campaign;
}

export const CampaignStats: React.FC<CampaignStatsProps> = ({ campaign }) => {
  return (
    <Card>
      <CardHeader className="bg-muted/40">
        <CardTitle className="text-lg">Live Statistics</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="border border-border/40">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <PhoneCall className="h-6 w-6 text-primary mb-2" />
              <p className="text-muted-foreground text-sm">Total Calls</p>
              <p className="text-2xl font-bold">{campaign.totalCalls}</p>
            </CardContent>
          </Card>
          
          <Card className="border border-border/40">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Phone className="h-6 w-6 text-green-500 mb-2" />
              <p className="text-muted-foreground text-sm">Answered</p>
              <p className="text-2xl font-bold">{campaign.answeredCalls}</p>
            </CardContent>
          </Card>
          
          <Card className="border border-border/40">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <PhoneForwarded className="h-6 w-6 text-blue-500 mb-2" />
              <p className="text-muted-foreground text-sm">Transferred</p>
              <p className="text-2xl font-bold">{campaign.transferredCalls}</p>
            </CardContent>
          </Card>
          
          <Card className="border border-border/40">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <PhoneOff className="h-6 w-6 text-destructive mb-2" />
              <p className="text-muted-foreground text-sm">Failed</p>
              <p className="text-2xl font-bold">{campaign.failedCalls}</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
