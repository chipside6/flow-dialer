
import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { CampaignItem } from "./CampaignItem";
import { useCampaignContext } from "@/contexts/campaign/CampaignContext";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CampaignTable: React.FC = () => {
  const { campaigns } = useCampaignContext();
  const navigate = useNavigate();

  const handleCreateCampaign = () => {
    // This should navigate to the campaign creation view
    navigate('/campaign', { state: { showCreateWizard: true } });
  };

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
            <TableCell colSpan={4} className="text-center py-8">
              <div className="flex flex-col items-center justify-center space-y-4 mx-auto px-4">
                <p className="text-muted-foreground">No campaigns found</p>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                  Create your first campaign to start making calls
                </p>
                <Button 
                  variant="success" 
                  className="gap-2 px-6 py-3 h-auto text-base rounded-md font-medium"
                  onClick={handleCreateCampaign}
                  size="lg"
                >
                  <PlusCircle className="h-5 w-5" /> Create Campaign
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          campaigns.map((campaign) => (
            <CampaignItem key={campaign.id} campaign={campaign} />
          ))
        )}
      </TableBody>
    </Table>
  );
};
