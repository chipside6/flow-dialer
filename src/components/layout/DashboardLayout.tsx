
import React from "react";
import { useSidebar, SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardSidebar } from "@/components/sidebar/DashboardSidebar";
import { MobileSidebarButton } from "@/components/sidebar/MobileSidebarButton";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full min-h-svh bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <DashboardLayoutContent children={children} />
      </div>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const { toggleSidebar, openMobile, isMobile } = useSidebar();
  
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
    <>
      {/* Mobile menu button - only show when sidebar is not open */}
      {isMobile && !openMobile && <MobileSidebarButton onClick={toggleSidebar} />}
      
      {/* DashboardSidebar */}
      <DashboardSidebar />

      {/* Main content area */}
      <div className={`flex-1 w-full max-w-full h-full overflow-auto pb-16 md:pb-0 pt-4 px-4 transition-all duration-300 ${
        !isMobile ? 'md:ml-64' : ''
      }`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </>
  );
}
