
import React from 'react';
import { SidebarInset } from "@/components/ui/sidebar";

interface DashboardContentProps {
  children: React.ReactNode;
}

export const DashboardContent = ({ children }: DashboardContentProps) => {
  return (
    <SidebarInset className="p-4 md:p-6 bg-background/50 dark:bg-background/10 min-h-screen overflow-hidden w-full">
      <div className="max-w-6xl mx-auto w-full overflow-hidden px-0 sm:px-2">
        {children}
      </div>
    </SidebarInset>
  );
};
