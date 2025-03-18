
import React, { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardCards } from "./DashboardCards";
import { EmptyCampaignState } from "./EmptyCampaignState";
import { useCampaigns } from "@/hooks/useCampaigns";
import BackgroundDialer from "@/components/BackgroundDialer";
import CampaignDashboard from "@/components/CampaignDashboard";
import { Phone, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { campaigns, isLoading } = useCampaigns();

  const renderLoadingState = () => {
    return (
      <div className="space-y-8">
        <div className="flex flex-col justify-center items-center h-64 rounded-lg border border-dashed p-8 text-center bg-white dark:bg-background shadow-sm">
          <div className="mb-6 relative">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-t-2 border-primary animate-spin absolute"></div>
            </div>
          </div>
          <h3 className="text-xl font-medium mb-2">Preparing your dashboard</h3>
          <p className="text-muted-foreground max-w-md mb-4">Loading your campaign data and analytics...</p>
          <Progress value={40} className="w-64 h-2" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg md:col-span-2" />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return renderLoadingState();
    }

    // Always show content, even when campaigns is empty
    switch (activeTab) {
      case 'dialer':
        return (
          <div className="mt-4">
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Quick Dial Mode</h3>
                  <p className="text-muted-foreground">Make calls directly from your campaign list without manual dialing.</p>
                </div>
              </div>
            </div>
            <BackgroundDialer campaignId={campaigns?.[0]?.id || "demo"} />
          </div>
        );
      case 'campaigns':
        return (
          <div className="mt-4">
            <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 p-6 rounded-xl border border-green-100 dark:border-green-900">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="bg-green-500/10 p-4 rounded-full">
                  <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Campaign Management</h3>
                  <p className="text-muted-foreground">View, edit and analyze all your active calling campaigns.</p>
                </div>
              </div>
            </div>
            <CampaignDashboard initialCampaigns={campaigns || []} />
          </div>
        );
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
