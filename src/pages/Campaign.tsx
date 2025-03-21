
import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import CampaignDashboard from "@/components/CampaignDashboard";
import { CampaignCreationWizard } from "@/components/campaign-wizard/CampaignCreationWizard";
import { PlusCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CampaignData } from "@/components/campaign-wizard/types";
import { useAuth } from "@/contexts/auth/useAuth";
import { Campaign } from "@/hooks/useCampaigns";
import { v4 as uuidv4 } from 'uuid';

const CampaignPage = () => {
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const { user } = useAuth();
  
  const handleCreateCampaign = (newCampaign: CampaignData) => {
    // Ensure the campaign has a user_id property and matches the Campaign type
    const campaignWithRequiredFields: Campaign = {
      id: newCampaign.id || uuidv4(),
      title: newCampaign.title,
      status: (newCampaign.status as Campaign["status"]) || "pending",
      progress: newCampaign.progress || 0,
      totalCalls: newCampaign.totalCalls || 0,
      answeredCalls: newCampaign.answeredCalls || 0,
      transferredCalls: newCampaign.transferredCalls || 0,
      failedCalls: newCampaign.failedCalls || 0,
      user_id: user?.id || ''
    };
    
    setCampaigns([...campaigns, campaignWithRequiredFields]);
    setShowCreateWizard(false);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Navbar />
      <div className="flex flex-1 w-full overflow-x-hidden">
        <DashboardLayout>
          <div className="max-w-6xl mx-auto w-full px-2 campaign-content">
            {showCreateWizard ? (
              <CampaignCreationWizard 
                onComplete={handleCreateCampaign}
                onCancel={() => setShowCreateWizard(false)}
              />
            ) : (
              <>
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                  <h1 className="text-3xl font-bold">Campaigns</h1>
                  <Button 
                    variant="success"
                    onClick={() => setShowCreateWizard(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </div>
                <div className="overflow-x-hidden w-full">
                  <CampaignDashboard initialCampaigns={campaigns} />
                </div>
              </>
            )}
          </div>
        </DashboardLayout>
      </div>
    </div>
  );
};

export default CampaignPage;
