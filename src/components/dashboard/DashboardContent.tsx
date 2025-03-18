
import React, { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardCards } from "./DashboardCards";
import { EmptyCampaignState } from "./EmptyCampaignState";
import { useCampaigns } from "@/hooks/useCampaigns";
import BackgroundDialer from "@/components/BackgroundDialer";

export const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { campaigns, isLoading } = useCampaigns();

  return (
    <>
      <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyCampaignState />
      ) : activeTab === 'dialer' ? (
        <BackgroundDialer campaignId={campaigns[0]?.id || "demo"} />
      ) : (
        <DashboardCards />
      )}
    </>
  );
};
