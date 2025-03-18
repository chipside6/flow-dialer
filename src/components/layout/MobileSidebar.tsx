
import React from "react";
import { X, Phone } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { NavList } from "@/components/layout/NavList";
import LogoutButton from "@/components/LogoutButton";
import { useLocation } from "react-router-dom";
import { UserProfile } from "@/contexts/auth/types";

interface MobileSidebarProps {
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  showOverlay: boolean;
  handleOverlayClick: () => void;
  profile?: UserProfile | null;
}

export const MobileSidebar = ({ 
  openMobile, 
  setOpenMobile, 
  showOverlay,
  handleOverlayClick,
  profile 
}: MobileSidebarProps) => {
  const location = useLocation();
  const isAdmin = profile?.is_admin === true;

  return (
    <>
      {/* Background overlay for mobile */}
      <div 
        className={`sidebar-overlay ${showOverlay ? 'active' : ''}`}
        onClick={handleOverlayClick}
      />

      {/* Mobile sidebar implementation using Sheet directly */}
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent 
          side="left" 
          className="p-0 border-0 w-[85%] z-[999]"
        >
          <div className="flex h-full flex-col bg-sidebar">
            <div className="flex items-center p-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white mr-3">
                <Phone size={18} />
              </div>
              <span className="font-semibold text-lg">Flow Dialer</span>
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
            </div>
            
            <div className="px-4 py-2 flex-1">
              <div className="bg-card rounded-lg border shadow-sm p-4 mb-4">
                <NavList 
                  location={location} 
                  isAdmin={isAdmin} 
                  onClick={() => setOpenMobile(false)} 
                />
                
                {/* Logout button */}
                <div className="mt-6 pt-4 border-t border-border">
                  <LogoutButton 
                    variant="ghost" 
                    className="w-full justify-start py-3 text-left" 
                    onClick={() => {
                      setOpenMobile(false);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
