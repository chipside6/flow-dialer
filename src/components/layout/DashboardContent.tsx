
import React from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardContentProps {
  children: React.ReactNode;
}

export const DashboardContent = ({ children }: DashboardContentProps) => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarInset className={`p-4 md:p-6 bg-background/50 dark:bg-background/10 min-h-screen ${isMobile ? 'pt-6' : 'pt-20 md:pt-6'} overflow-hidden w-full`}>
      <div className={`max-w-6xl mx-auto w-full overflow-hidden px-0 sm:px-2 ${isMobile ? 'pl-14' : ''}`}>
        {children}
      </div>
    </SidebarInset>
  );
};
