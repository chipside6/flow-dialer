
import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { CampaignItem } from "./CampaignItem";
import { useCampaignContext } from "@/contexts/campaign/CampaignContext";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/subscription";

export const CampaignTable: React.FC = () => {
  const { campaigns } = useCampaignContext();
  const navigate = useNavigate();
  const { currentPlan, trialExpired, isLoading: subscriptionLoading } = useSubscription();
  
  // Check if user can create campaigns - only show upgrade notice when we're sure about subscription status
  const canCreateCampaigns = currentPlan === 'lifetime' || 
                          (currentPlan === 'trial' && !trialExpired);
  const subscriptionChecked = !subscriptionLoading;

  const handleCreateCampaign = () => {
    // This should navigate to the campaign creation view
    navigate('/campaign', { state: { showCreateWizard: true } });
  };

  return (
    <div className="w-full flex flex-col items-center">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%] whitespace-nowrap">Name</TableHead>
            <TableHead className="w-[15%] text-center whitespace-nowrap">Execution</TableHead>
            <TableHead className="w-[30%] text-center whitespace-nowrap">Progress</TableHead>
            <TableHead className="text-right w-[25%] whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <div className="flex flex-col items-center justify-center space-y-4 mx-auto px-4">
                  <p className="text-muted-foreground">No campaigns found</p>
                  
                  {subscriptionChecked && !canCreateCampaigns ? (
                    <div className="text-center space-y-2 max-w-md mx-auto">
                      <div className="flex items-center justify-center gap-2 text-amber-500">
                        <AlertTriangle className="h-4 w-4" />
                        <p className="text-sm font-medium">Your trial has expired</p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upgrade to lifetime access to create and run campaigns
                      </p>
                      <Button 
                        className="gap-2 px-6 py-3 h-auto text-base rounded-md font-medium mx-auto"
                        onClick={() => navigate('/upgrade')}
                        size="lg"
                      >
                        Upgrade Now
                      </Button>
                    </div>
                  ) : (
                    subscriptionChecked && (
                      <div className="text-center mx-auto">
                        <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                          Create your first campaign to start making calls
                        </p>
                        <Button 
                          variant="success" 
                          className="gap-2 px-6 py-3 h-auto text-base rounded-md font-medium mx-auto"
                          onClick={handleCreateCampaign}
                          size="lg"
                        >
                          <PlusCircle className="h-5 w-5" /> Create Campaign
                        </Button>
                      </div>
                    )
                  )}
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
    </div>
  );
};
