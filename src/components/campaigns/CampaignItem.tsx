
import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, BarChart, Eye } from "lucide-react";
import { Campaign } from "@/types/campaign";
import { useCampaignContext } from "@/contexts/campaign/CampaignContext";
import { StatisticsModal } from "./StatisticsModal";

interface CampaignItemProps {
  campaign: Campaign;
}

export const CampaignItem: React.FC<CampaignItemProps> = ({ campaign }) => {
  const { setSelectedCampaign, startCampaign, pauseCampaign } = useCampaignContext();
  const [statsModalOpen, setStatsModalOpen] = useState(false);

  return (
    <>
      <TableRow 
        key={campaign.id} 
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => setSelectedCampaign(campaign)}
      >
        <TableCell className="font-medium whitespace-nowrap">{campaign.title}</TableCell>
        <TableCell className="whitespace-nowrap">
          <span className={`px-2 py-1 rounded-full text-xs ${
            campaign.status === "running" ? "bg-green-100 text-green-800" : 
            campaign.status === "paused" ? "bg-yellow-100 text-yellow-800" : 
            campaign.status === "completed" ? "bg-blue-100 text-blue-800" : 
            "bg-gray-100 text-gray-800"
          }`}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </span>
        </TableCell>
        <TableCell className="w-[30%]">
          <div className="flex items-center gap-2">
            <Progress value={campaign.progress} className="h-2" />
            <span className="text-xs whitespace-nowrap">{campaign.progress}%</span>
          </div>
        </TableCell>
        <TableCell className="text-right whitespace-nowrap">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setStatsModalOpen(true);
              }}
              title="View Statistics"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {campaign.status === "running" ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  pauseCampaign(campaign.id);
                }}
              >
                <Pause className="h-4 w-4 mr-1" /> Pause
              </Button>
            ) : campaign.status === "completed" ? (
              <Button variant="outline" size="sm" disabled>
                <BarChart className="h-4 w-4 mr-1" /> View Report
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  startCampaign(campaign.id);
                }}
              >
                <Play className="h-4 w-4 mr-1" /> Start
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
      <StatisticsModal
        campaign={campaign}
        open={statsModalOpen}
        onOpenChange={setStatsModalOpen}
      />
    </>
  );
};
