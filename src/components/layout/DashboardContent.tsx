
import React from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardContentProps {
  children: React.ReactNode;
}

export const DashboardContent = ({ children }: DashboardContentProps) => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarInset className={`bg-slate-50 dark:bg-slate-900 ${
      isMobile ? 'pt-2' : 'pt-4'
    } w-full max-w-full h-full overflow-hidden flex-1`}>
      <div className={`mx-auto w-full h-full overflow-auto ${
        isMobile ? 'px-3' : 'max-w-6xl px-4'
      }`}>
        {children}
      </div>
    </SidebarInset>
  );
};
