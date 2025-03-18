
import React from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardSidebar } from "@/components/sidebar/DashboardSidebar";
import { DashboardContent } from "@/components/layout/DashboardContent";
import { MobileSidebarButton } from "@/components/sidebar/MobileSidebarButton";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-1 w-full overflow-x-hidden">
      {/* Mobile menu button - always visible on mobile */}
      {isMobile && <MobileSidebarButton onClick={toggleSidebar} />}
      
      <DashboardSidebar />
      <DashboardContent>
        {children}
      </DashboardContent>
    </div>
  );
}
