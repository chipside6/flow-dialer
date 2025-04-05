
import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Phone, BarChart3 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface DashboardHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardHeader = ({ activeTab, setActiveTab }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col gap-3 mb-4">
      <h1 className="text-xl sm:text-2xl font-bold">Campaign Analytics</h1>
      
      {/* Mobile-optimized tabs using the shadcn Tabs component */}
      <div className="overflow-x-auto -mx-2 px-2 tab-container">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md bg-muted/70 rounded-full p-1">
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
        </Tabs>
      </div>
    </div>
  );
};
