
import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import CampaignDashboard from "@/components/CampaignDashboard";
import { CampaignCreationWizard } from "@/components/CampaignCreationWizard";
import { PlusCircle, Phone } from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarInset
} from "@/components/ui/sidebar";
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
      <div className="flex flex-1 w-full pt-16">
        <Sidebar collapsible="offcanvas">
          <SidebarHeader>
            <div className="flex items-center p-2">
              <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white mr-2">
                <Phone size={16} />
              </span>
              <span className="font-semibold text-lg">Flow Dialer</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <DashboardNav />
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="p-6">
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
        </SidebarInset>
      </div>
    </div>
  );
};

export default CampaignPage;
