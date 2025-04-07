
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PhoneCall, Phone, PhoneForwarded, PhoneOff } from "lucide-react";
import { Campaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { StatisticsModal } from "./StatisticsModal";

interface CampaignStatsProps {
  campaign: Campaign;
}

export const CampaignStats: React.FC<CampaignStatsProps> = ({ campaign }) => {
  const [showStatsModal, setShowStatsModal] = useState(false);
  
  return (
    <>
      <Card className="overflow-hidden campaign-stats-card w-full">
        <CardHeader className="bg-muted/40 px-4 py-3">
          <CardTitle className="text-base md:text-lg">Campaign Statistics</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <Card className="border border-border/40">
              <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                <PhoneCall className="h-5 w-5 text-primary mb-1" />
                <p className="text-muted-foreground text-xs sm:text-sm">Total Calls</p>
                <p className="text-xl sm:text-2xl font-bold">{campaign.totalCalls || 0}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-1 px-2 h-8 text-xs flex items-center"
                  onClick={() => setShowStatsModal(true)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  <span>View Numbers</span>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border border-border/40">
              <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                <Phone className="h-5 w-5 text-green-500 mb-1" />
                <p className="text-muted-foreground text-xs sm:text-sm">Answered</p>
                <p className="text-xl sm:text-2xl font-bold">{campaign.answeredCalls || 0}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-1 px-2 h-8 text-xs flex items-center"
                  onClick={() => setShowStatsModal(true)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  <span>View Numbers</span>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border border-border/40">
              <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                <PhoneForwarded className="h-5 w-5 text-blue-500 mb-1" />
                <p className="text-muted-foreground text-xs sm:text-sm">Transferred</p>
                <p className="text-xl sm:text-2xl font-bold">{campaign.transferredCalls || 0}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-1 px-2 h-8 text-xs flex items-center"
                  onClick={() => setShowStatsModal(true)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  <span>View Numbers</span>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border border-border/40">
              <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                <PhoneOff className="h-5 w-5 text-destructive mb-1" />
                <p className="text-muted-foreground text-xs sm:text-sm">Failed</p>
                <p className="text-xl sm:text-2xl font-bold">{campaign.failedCalls || 0}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-1 px-2 h-8 text-xs flex items-center"
                  onClick={() => setShowStatsModal(true)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  <span>View Numbers</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <StatisticsModal 
        campaign={campaign} 
        open={showStatsModal} 
        onOpenChange={setShowStatsModal} 
      />
    </>
  );
};
