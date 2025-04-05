
import React from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardContentProps {
  children: React.ReactNode;
}

export const DashboardContent = ({ children }: DashboardContentProps) => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarInset className={`p-0 bg-background/50 dark:bg-background/10 ${
      isMobile ? 'pt-2' : 'pt-4'
    } w-full max-w-full overflow-hidden`}>
      <div className={`mx-auto w-full ${isMobile ? 'px-2' : 'max-w-6xl px-4'}`}>
        {children}
      </div>
    </SidebarInset>
  );
};
