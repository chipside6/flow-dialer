import React, { useState, useEffect } from 'react';
import { Campaign } from '@/hooks/useCampaigns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, StopCircle, MoreHorizontal, Phone } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { asteriskService } from '@/utils/asteriskService';
import { useToast } from '@/components/ui/use-toast';

interface CampaignDashboardProps {
  initialCampaigns: Campaign[];
}

const CampaignDashboard: React.FC<CampaignDashboardProps> = ({ initialCampaigns }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns || []);
  const { toast } = useToast();

  useEffect(() => {
    setCampaigns(initialCampaigns || []);
  }, [initialCampaigns]);

  const handleStartCampaign = async (campaignId: string) => {
    try {
      await asteriskService.startCampaign(campaignId, {});
      
      // Update local state to show campaign as running
      setCampaigns(prev => 
        prev.map(camp => 
          camp.id === campaignId 
            ? { ...camp, status: 'running' } 
            : camp
        )
      );
      
      toast({
        title: "Campaign Started",
        description: "Your campaign is now running",
      });
    } catch (error: any) {
      console.error("Error starting campaign:", error);
      toast({
        title: "Error Starting Campaign",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      // Implement pause functionality
      setCampaigns(prev => 
        prev.map(camp => 
          camp.id === campaignId 
            ? { ...camp, status: 'paused' } 
            : camp
        )
      );
      
      toast({
        title: "Campaign Paused",
        description: "Your campaign has been paused",
      });
    } catch (error: any) {
      console.error("Error pausing campaign:", error);
      toast({
        title: "Error Pausing Campaign",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleStopCampaign = async (campaignId: string) => {
    try {
      await asteriskService.stopCampaign(campaignId);
      
      // Update local state to show campaign as completed
      setCampaigns(prev => 
        prev.map(camp => 
          camp.id === campaignId 
            ? { ...camp, status: 'completed' } 
            : camp
        )
      );
      
      toast({
        title: "Campaign Stopped",
        description: "Your campaign has been stopped",
      });
    } catch (error: any) {
      console.error("Error stopping campaign:", error);
      toast({
        title: "Error Stopping Campaign",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'paused':
        return 'warning';
      case 'completed':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Campaign Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No campaigns found. Create a new campaign to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Calls</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.title}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(campaign.status)}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={campaign.progress} className="h-2 w-[100px]" />
                      <span className="text-xs text-muted-foreground">{campaign.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col text-xs">
                      <span>Total: {campaign.totalCalls}</span>
                      <span className="text-green-500">Answered: {campaign.answeredCalls}</span>
                      <span className="text-blue-500">Transferred: {campaign.transferredCalls}</span>
                      <span className="text-red-500">Failed: {campaign.failedCalls}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {campaign.status === 'running' ? (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handlePauseCampaign(campaign.id)}
                          title="Pause Campaign"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : campaign.status === 'paused' || campaign.status === 'pending' ? (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleStartCampaign(campaign.id)}
                          title="Start Campaign"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : null}
                      
                      {(campaign.status === 'running' || campaign.status === 'paused') && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleStopCampaign(campaign.id)}
                          title="Stop Campaign"
                        >
                          <StopCircle className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Campaign</DropdownMenuItem>
                          <DropdownMenuItem>Clone Campaign</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete Campaign</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignDashboard;
