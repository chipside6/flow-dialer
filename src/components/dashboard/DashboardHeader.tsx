
import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Phone, BarChart3 } from "lucide-react";

interface DashboardHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardHeader = ({ activeTab, setActiveTab }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Campaign Analytics</h1>
      <div className="flex space-x-2">
        <Button 
          variant={activeTab === 'overview' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setActiveTab('overview')}
          className="rounded-full"
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Overview
        </Button>
        <Button 
          variant={activeTab === 'dialer' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setActiveTab('dialer')}
          className="rounded-full"
        >
          <Phone className="h-4 w-4 mr-2" />
          Quick Dial
        </Button>
        <Button 
          variant={activeTab === 'campaigns' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setActiveTab('campaigns')}
          className="rounded-full"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Campaigns
        </Button>
      </div>
    </div>
  );
};
