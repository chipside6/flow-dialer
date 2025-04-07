
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlayCircle, PauseCircle, Trash2 } from "lucide-react";
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

  if (!campaigns.length) {
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    {campaign.status !== 'running' && (
                      <DropdownMenuItem onClick={() => startCampaign(campaign.id)}>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        <span>Start Campaign</span>
                      </DropdownMenuItem>
                    )}
                    {campaign.status === 'running' && (
                      <DropdownMenuItem onClick={() => pauseCampaign(campaign.id)}>
                        <PauseCircle className="mr-2 h-4 w-4" />
                        <span>Pause Campaign</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => deleteCampaign(campaign.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
