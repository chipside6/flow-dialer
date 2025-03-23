
import React from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardContentProps {
  children: React.ReactNode;
}

export const DashboardContent = ({ children }: DashboardContentProps) => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarInset className={`p-0 sm:p-4 md:p-6 bg-background/50 dark:bg-background/10 min-h-screen ${
      isMobile ? 'pt-4' : 'pt-6'
    } overflow-hidden w-full`}>
      <div className={`mx-auto w-full overflow-x-hidden ${isMobile ? 'px-4' : 'max-w-6xl px-4'}`}>
        {children}
      </div>
    </SidebarInset>
  );
};
