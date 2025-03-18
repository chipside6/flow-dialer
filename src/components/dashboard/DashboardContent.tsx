
import React, { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardCards } from "./DashboardCards";
import { EmptyCampaignState } from "./EmptyCampaignState";
import { useCampaigns } from "@/hooks/useCampaigns";
import BackgroundDialer from "@/components/BackgroundDialer";
import CampaignDashboard from "@/components/CampaignDashboard";

export const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { campaigns, isLoading } = useCampaigns();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Always show content, even when campaigns is empty
    switch (activeTab) {
      case 'dialer':
        return <BackgroundDialer campaignId={campaigns?.[0]?.id || "demo"} />;
      case 'campaigns':
        return <CampaignDashboard initialCampaigns={campaigns || []} />;
      case 'overview':
      default:
        return campaigns && campaigns.length > 0 ? <DashboardCards /> : <EmptyCampaignState />;
    }
  };

  return (
    <div className="space-y-4">
      <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
    </div>
  );
};
