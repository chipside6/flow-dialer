
import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import CampaignDashboard from "@/components/CampaignDashboard";
import { CampaignCreationWizard } from "@/components/CampaignCreationWizard";
import { PlusCircle } from "lucide-react";

const Campaign = () => {
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  
  const handleCreateCampaign = (newCampaign: any) => {
    setCampaigns([...campaigns, newCampaign]);
    setShowCreateWizard(false);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <DashboardNav />
            </div>
            <div className="md:w-3/4">
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Campaign;
