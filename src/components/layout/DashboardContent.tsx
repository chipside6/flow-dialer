
import React from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardContentProps {
  children: React.ReactNode;
}

export const DashboardContent = ({ children }: DashboardContentProps) => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarInset className={`p-4 md:p-6 bg-background/50 dark:bg-background/10 min-h-screen ${isMobile ? 'pt-6 pl-16' : 'pt-20 md:pt-6'} w-full overflow-x-hidden`}>
      <div className="max-w-6xl mx-auto w-full px-0 sm:px-2 dashboard-content">
        {children}
      </div>
    </SidebarInset>
  );
};
