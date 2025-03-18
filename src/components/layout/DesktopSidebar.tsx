
import React from "react";
import { Phone, X } from "lucide-react";
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent 
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { NavList } from "@/components/layout/NavList";
import LogoutButton from "@/components/LogoutButton";
import { useLocation } from "react-router-dom";
import { UserProfile } from "@/contexts/auth/types";

interface DesktopSidebarProps {
  profile?: UserProfile | null;
  isMobile: boolean;
  setOpenMobile: (open: boolean) => void;
}

export const DesktopSidebar = ({ 
  profile, 
  isMobile, 
  setOpenMobile 
}: DesktopSidebarProps) => {
  const location = useLocation();
  const isAdmin = profile?.is_admin === true;

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center p-4 mt-16 md:mt-0"> {/* Increased mt for mobile to avoid navbar overlap */}
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white mr-3">
            <Phone size={18} />
          </div>
          <span className="font-semibold text-lg">Flow Dialer</span>
          
          {/* Close button for mobile */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto" 
              onClick={() => {
                console.log('Close button clicked');
                setOpenMobile(false);
              }}
            >
              <X size={20} />
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4 py-2">
        <div className="bg-card rounded-lg border shadow-sm p-4 mb-4">
          <NavList 
            location={location} 
            isAdmin={isAdmin} 
            onClick={() => {
              if (isMobile) setOpenMobile(false);
            }} 
          />
          
          {/* Logout button */}
          <div className="mt-6 pt-4 border-t border-border">
            <LogoutButton 
              variant="ghost" 
              className="w-full justify-start py-3 text-left" 
              onClick={() => {
                if (isMobile) setOpenMobile(false);
              }}
            />
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
