
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { MobileMenuButton } from "@/components/layout/MobileMenuButton";
import { X } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile } = useAuth();
  const { setOpenMobile, openMobile } = useSidebar();
  const isMobile = useIsMobile();
  const [showOverlay, setShowOverlay] = useState(false);
  
  // Handle overlay and body class for mobile menu
  useEffect(() => {
    if (openMobile) {
      document.body.classList.add('mobile-menu-open');
      // Delay showing overlay slightly for a smoother transition
      setTimeout(() => setShowOverlay(true), 50);
      
      // Ensure that any dialogs that might be open have the correct z-index
      const dialogs = document.querySelectorAll('[role="dialog"]');
      dialogs.forEach(dialog => {
        if (dialog instanceof HTMLElement) {
          dialog.style.display = 'flex';
          dialog.style.visibility = 'visible';
          dialog.style.zIndex = '999';
          dialog.style.opacity = '1';
        }
      });
      
      // Additional fixes for sheet content
      const sheetContent = document.querySelectorAll('[data-sidebar][data-mobile="true"]');
      sheetContent.forEach(sheet => {
        if (sheet instanceof HTMLElement) {
          sheet.style.display = 'flex';
          sheet.style.visibility = 'visible';
          sheet.style.opacity = '1';
        }
      });
    } else {
      document.body.classList.remove('mobile-menu-open');
      setShowOverlay(false);
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
      setShowOverlay(false);
    };
  }, [openMobile]);
  
  // Handle closing the sidebar when clicking outside
  const handleOverlayClick = () => {
    if (openMobile) {
      setOpenMobile(false);
    }
  };
  
  // Debug mobile sidebar state
  useEffect(() => {
    console.log('Mobile sidebar state:', { isMobile, openMobile });
  }, [isMobile, openMobile]);
  
  if (isMobile) {
    return (
      <div className="flex flex-1 w-full overflow-x-hidden">
        {/* Mobile menu button */}
        <MobileMenuButton 
          onClick={() => setOpenMobile(!openMobile)} 
        />
        
        {/* Mobile sidebar */}
        <MobileSidebar 
          openMobile={openMobile}
          setOpenMobile={setOpenMobile}
          showOverlay={showOverlay}
          handleOverlayClick={handleOverlayClick}
          profile={profile}
        />
        
        <SidebarInset className="p-4 md:p-6 bg-background/50 dark:bg-background/10 min-h-screen pt-16 md:pt-6 overflow-x-hidden w-full">
          <div className="max-w-6xl mx-auto w-full overflow-x-hidden px-0 sm:px-2">
            {children}
          </div>
        </SidebarInset>
      </div>
    );
  }
  
  // Desktop version
  return (
    <div className="flex flex-1 w-full overflow-x-hidden">
      <DesktopSidebar 
        profile={profile}
        isMobile={isMobile}
        setOpenMobile={setOpenMobile}
      />
      <SidebarInset className="p-4 md:p-6 bg-background/50 dark:bg-background/10 min-h-screen pt-16 md:pt-6 overflow-x-hidden w-full">
        <div className="max-w-6xl mx-auto w-full overflow-x-hidden px-0 sm:px-2">
          {children}
        </div>
      </SidebarInset>
    </div>
  );
}
