
import React from "react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardHeader = ({ activeTab, setActiveTab }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">Campaign Analytics</h1>
      <div className="flex space-x-2">
        <Button 
          variant={activeTab === 'overview' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Button>
        <Button 
          variant={activeTab === 'dialer' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setActiveTab('dialer')}
        >
          Quick Dial
        </Button>
      </div>
    </div>
  );
};
