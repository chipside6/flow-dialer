
import React from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardSidebar } from "@/components/sidebar/DashboardSidebar";
import { MobileSidebarButton } from "@/components/sidebar/MobileSidebarButton";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { toggleSidebar, openMobile } = useSidebar();
  const isMobile = useIsMobile();
  
  // Add class to body when sidebar is open
  React.useEffect(() => {
    if (isMobile && openMobile) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobile, openMobile]);
  
  return (
    <div className="flex flex-1 w-full h-full overflow-hidden">
      {/* Mobile menu button - only show when sidebar is not open */}
      {isMobile && !openMobile && <MobileSidebarButton onClick={toggleSidebar} />}
      
      {/* DashboardSidebar contains its own header on mobile */}
      <DashboardSidebar />
      <div className="flex-1 w-full max-w-full h-full overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
