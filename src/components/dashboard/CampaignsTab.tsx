
import React from 'react';
import { Button } from '@/components/ui/button';
import { CampaignProvider } from '@/contexts/campaign/CampaignContext';
import { Campaign } from '@/types/campaign';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { DashboardContent } from '@/components/layout/DashboardContent';
import { PlusCircle, Loader2 } from 'lucide-react';

interface CampaignsTabProps {
  campaigns: Campaign[];
  isLoading: boolean;
  handleCreateCampaign: () => void;
}

export const CampaignsTab = ({ campaigns, isLoading, handleCreateCampaign }: CampaignsTabProps) => {
  return (
    <DashboardContent>
      {/* Add create campaign button at the top */}
      <div className="flex justify-center mb-4 pt-4">
        <Button 
          variant="success" 
          onClick={handleCreateCampaign}
          className="w-auto px-6 py-2 h-auto"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>
      
      {isLoading ? (
        <div className="border rounded-lg p-8 text-center bg-gray-50 mx-auto max-w-lg">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground mb-2">Loading campaigns...</p>
          </div>
        </div>
      ) : (
        <CampaignProvider initialCampaigns={campaigns || []}>
          <div className="campaign-table-container w-full p-4 mx-auto">
            <CampaignTable />
          </div>
        </CampaignProvider>
      )}
    </DashboardContent>
  );
};
