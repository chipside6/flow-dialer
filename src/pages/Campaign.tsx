
import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import CampaignDashboard from "@/components/CampaignDashboard";
import { CampaignCreationWizard } from "@/components/CampaignCreationWizard";
import { PlusCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Campaign } from "@/hooks/useCampaigns";

const CampaignPage = () => {
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  
  const handleCreateCampaign = (newCampaign: Campaign) => {
    setCampaigns([...campaigns, newCampaign]);
    setShowCreateWizard(false);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 w-full">
        <DashboardLayout>
          <div className="max-w-6xl mx-auto w-full">
            {showCreateWizard ? (
              <CampaignCreationWizard 
                onComplete={handleCreateCampaign}
                onCancel={() => setShowCreateWizard(false)}
              />
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold">Campaigns</h1>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setShowCreateWizard(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </div>
                <CampaignDashboard initialCampaigns={campaigns} />
              </>
            )}
          </div>
        </DashboardLayout>
      </div>
    </div>
  );
};

export default CampaignPage;
