import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Edit, Trash2, Play, Pause, StopCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth/useAuth";
import { useNavigate } from 'react-router-dom';
import { useCampaigns } from "@/hooks/useCampaigns";
import { asteriskService } from "@/utils/asteriskService";

interface Campaign {
  id: string;
  title: string;
  status: string;
  progress: number;
  totalCalls: number;
  answeredCalls: number;
  transferredCalls: number;
  failedCalls: number;
  dateCreated: Date;
  dateUpdated: Date;
  contactListId: string | null;
}

const CampaignDashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { campaigns: fetchedCampaigns, isLoading, refreshCampaigns } = useCampaigns();
  
  useEffect(() => {
    if (fetchedCampaigns) {
      setCampaigns(fetchedCampaigns);
    }
  }, [fetchedCampaigns]);

  const handleEdit = (id: string) => {
    navigate(`/campaigns`, { state: { campaignId: id } });
  };

  const handleDelete = async (id: string) => {
    setCampaignToDelete(id);
  };

  const confirmDelete = async () => {
    if (campaignToDelete) {
      try {
        // Optimistically update the UI
        setCampaigns(campaigns.filter(campaign => campaign.id !== campaignToDelete));
        
        // Simulate API deletion
        await new Promise(resolve => setTimeout(resolve, 500));
        
        toast({
          title: "Campaign Deleted",
          description: "The campaign has been successfully deleted.",
        });
      } catch (error) {
        console.error("Error deleting campaign:", error);
        toast({
          title: "Error",
          description: "Failed to delete the campaign.",
          variant: "destructive",
        });
        // Revert the UI update in case of failure
        refreshCampaigns();
      } finally {
        setCampaignToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setCampaignToDelete(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return <Badge variant="success">Running</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>; // Changed from "warning" to "secondary"
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>; // Changed from "warning" to "secondary" if it was using "warning"
    }
  };

  const handleStartCampaign = async (campaignId: string) => {
    try {
      // Call the startCampaign method from asteriskService
      await asteriskService.startCampaign(campaignId, {}); // Pass any necessary options
      
      // Update the campaign status in the UI
      setCampaigns(campaigns.map(campaign =>
        campaign.id === campaignId ? { ...campaign, status: 'running' } : campaign
      ));
      
      toast({
        title: "Campaign Started",
        description: "The campaign has been started successfully.",
      });
    } catch (error: any) {
      console.error("Error starting campaign:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start the campaign.",
        variant: "destructive",
      });
    }
  };
  
  const handleStopCampaign = async (campaignId: string) => {
    try {
      // Call the stopCampaign method from asteriskService
      await asteriskService.stopCampaign(campaignId);
      
      // Update the campaign status in the UI
      setCampaigns(campaigns.map(campaign =>
        campaign.id === campaignId ? { ...campaign, status: 'stopped' } : campaign
      ));
      
      toast({
        title: "Campaign Stopped",
        description: "The campaign has been stopped successfully.",
      });
    } catch (error: any) {
      console.error("Error stopping campaign:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to stop the campaign.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-3">Title</TableHead>
              <TableHead className="px-6 py-3">Status</TableHead>
              <TableHead className="px-6 py-3">Progress</TableHead>
              <TableHead className="px-6 py-3">Total Calls</TableHead>
              <TableHead className="px-6 py-3">Answered Calls</TableHead>
              <TableHead className="px-6 py-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {campaign.title}
                </TableCell>
                <TableCell className="px-6 py-4">
                  {getStatusBadge(campaign.status)}
                </TableCell>
                <TableCell className="px-6 py-4">{campaign.progress}%</TableCell>
                <TableCell className="px-6 py-4">{campaign.totalCalls}</TableCell>
                <TableCell className="px-6 py-4">{campaign.answeredCalls}</TableCell>
                <TableCell className="px-6 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(campaign.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      {campaign.status.toLowerCase() !== 'running' && (
                        <DropdownMenuItem onClick={() => handleStartCampaign(campaign.id)}>
                          <Play className="h-4 w-4 mr-2" />
                          <span>Start</span>
                        </DropdownMenuItem>
                      )}
                      {campaign.status.toLowerCase() === 'running' && (
                        <DropdownMenuItem onClick={() => handleStopCampaign(campaign.id)}>
                          <StopCircle className="h-4 w-4 mr-2" />
                          <span>Stop</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(campaign.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
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

      <AlertDialog open={campaignToDelete !== null} onOpenChange={(open) => {
        if (!open) {
          setCampaignToDelete(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the campaign and all of its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CampaignDashboard;
