
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, Trash2, Loader2 } from "lucide-react";
import { badgeVariantFromStatus } from "@/utils/campaignUtils";
import { Badge } from "@/components/ui/badge";
import { useCampaignContext } from "@/contexts/campaign/CampaignContext";
import { formatDistanceToNow } from "date-fns";
import { EmptyCampaignState } from "@/components/dashboard/EmptyCampaignState";

export const CampaignTable = () => {
  const { 
    campaigns, 
    selectedCampaignId, 
    setSelectedCampaignId,
    startCampaign,
    pauseCampaign,
    deleteCampaign
  } = useCampaignContext();

  // Debug logging to find the issue
  console.log("CampaignTable - campaigns data:", campaigns);

  // Handle loading state or no campaigns
  if (!campaigns || campaigns.length === 0) {
    console.log("CampaignTable - No campaigns found");
    return <EmptyCampaignState />;
  }

  return (
    <div className="overflow-auto campaign-table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%] md:w-[30%]">Campaign</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
            <TableHead className="w-[25%] text-center">Status</TableHead>
            <TableHead className="w-[15%] md:w-[10%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow 
              key={campaign.id}
              className={selectedCampaignId === campaign.id ? "bg-muted/50" : undefined}
              onClick={() => setSelectedCampaignId(campaign.id)}
            >
              <TableCell className="font-medium truncate max-w-[200px]">
                <div className="table-cell-content">{campaign.title}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                {campaign.created_at ? 
                  formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true }) : 
                  'Unknown'
                }
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={badgeVariantFromStatus(campaign.status)} className="capitalize">
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1 action-buttons">
                  {campaign.status !== 'running' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        startCampaign(campaign.id);
                      }}
                      className="h-8 w-8 p-0"
                      title="Start Campaign"
                    >
                      <PlayCircle className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                  {campaign.status === 'running' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        pauseCampaign(campaign.id);
                      }}
                      className="h-8 w-8 p-0"
                      title="Pause Campaign"
                    >
                      <PauseCircle className="h-4 w-4 text-amber-500" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCampaign(campaign.id);
                    }}
                    className="h-8 w-8 p-0"
                    title="Delete Campaign"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
