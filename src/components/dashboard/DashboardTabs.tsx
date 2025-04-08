
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Phone, BarChart3 } from "lucide-react";

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

export const DashboardTabs = ({ activeTab, onTabChange, children }: DashboardTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full h-full overflow-hidden">
      <TabsList className="w-full max-w-md bg-muted/70 rounded-full p-1 mb-4">
        <TabsTrigger 
          value="overview" 
          className="flex items-center rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <LayoutDashboard className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="text-xs sm:text-sm">Overview</span>
        </TabsTrigger>
        <TabsTrigger 
          value="dialer" 
          className="flex items-center rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Phone className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="text-xs sm:text-sm">Quick Dial</span>
        </TabsTrigger>
        <TabsTrigger 
          value="campaigns" 
          className="flex items-center rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="text-xs sm:text-sm">Campaigns</span>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};
