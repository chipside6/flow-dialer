
import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, BarChart } from "lucide-react";
import { Campaign } from "@/hooks/useCampaigns";

interface CampaignTableProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onStartCampaign: (campaignId: string) => void;
  onPauseCampaign: (campaignId: string) => void;
}

export const CampaignTable: React.FC<CampaignTableProps> = ({
  campaigns,
  onSelectCampaign,
  onStartCampaign,
  onPauseCampaign
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Execution</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-6">
              No active campaigns found. Create a campaign to get started.
            </TableCell>
          </TableRow>
        ) : (
          campaigns.map((campaign) => (
            <TableRow 
              key={campaign.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectCampaign(campaign)}
            >
              <TableCell className="font-medium">{campaign.title}</TableCell>
              <TableCell>
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
              <TableCell className="text-right">
                {campaign.status === "running" ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onPauseCampaign(campaign.id);
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
                      onStartCampaign(campaign.id);
                    }}
                  >
                    <Play className="h-4 w-4 mr-1" /> Start
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
