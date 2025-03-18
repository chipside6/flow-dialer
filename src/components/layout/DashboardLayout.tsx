
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarInset, 
  useSidebar 
} from "@/components/ui/sidebar";
import { 
  Phone, 
  Home, 
  BarChart3, 
  AudioWaveform, 
  ContactIcon, 
  PhoneForwarded, 
  Server, 
  ShieldCheck,
  X,
  Menu
} from "lucide-react";
import { NavItem } from "@/components/navigation/NavItem";
import { useLocation } from "react-router-dom";
import LogoutButton from "@/components/LogoutButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile } = useAuth();
  const location = useLocation();
  const { setOpenMobile, openMobile, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const [showOverlay, setShowOverlay] = useState(false);
  
  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  }, [location.pathname, isMobile, setOpenMobile, openMobile]);
  
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
  
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Campaigns", path: "/campaign", icon: <BarChart3 className="h-5 w-5" /> },
    { name: "Greeting Files", path: "/greetings", icon: <AudioWaveform className="h-5 w-5" /> },
    { name: "Contact Lists", path: "/contacts", icon: <ContactIcon className="h-5 w-5" /> },
    { name: "Transfer Numbers", path: "/transfers", icon: <PhoneForwarded className="h-5 w-5" /> },
    { name: "SIP Providers", path: "/sip-providers", icon: <Server className="h-5 w-5" /> },
  ];
  
  // Add admin link for admin users
  const isAdmin = profile?.is_admin === true;
  
  // Debug mobile sidebar state
  useEffect(() => {
    console.log('Mobile sidebar state:', { isMobile, openMobile });
  }, [isMobile, openMobile]);
  
  // This is an alternative implementation using the Sheet component directly for mobile
  if (isMobile) {
    return (
      <div className="flex flex-1 w-full overflow-x-hidden">
        {/* Mobile menu button - always visible on mobile */}
        <div className="fixed top-4 left-4 z-50">
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-background rounded-full shadow-md" 
            onClick={() => {
              console.log('Menu button clicked, toggling sidebar');
              setOpenMobile(!openMobile);
            }}
          >
            <Menu size={20} />
          </Button>
        </div>
        
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
                  <nav className="space-y-2">
                    {navItems.map((item) => (
                      <NavItem 
                        key={item.path} 
                        item={item} 
                        isActive={location.pathname === item.path}
                        onClick={() => {
                          console.log('Nav item clicked:', item.path);
                          setOpenMobile(false);
                        }}
                      />
                    ))}
                    
                    {/* Admin Panel Link */}
                    {isAdmin && (
                      <NavItem 
                        item={{
                          name: "Admin Panel",
                          path: "/admin",
                          icon: <ShieldCheck className="h-5 w-5" />
                        }}
                        isActive={location.pathname === "/admin"}
                        onClick={() => {
                          setOpenMobile(false);
                        }}
                      />
                    )}
                  </nav>
                  
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
        
        <SidebarInset className="p-4 md:p-6 bg-background/50 dark:bg-background/10 min-h-screen pt-16 md:pt-6 overflow-x-hidden w-full">
          <div className="max-w-6xl mx-auto w-full overflow-x-hidden px-0 sm:px-2">
            {children}
          </div>
        </SidebarInset>
      </div>
    );
  }
  
  // Desktop version remains unchanged
  return (
    <div className="flex flex-1 w-full overflow-x-hidden">
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
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavItem 
                  key={item.path} 
                  item={item} 
                  isActive={location.pathname === item.path}
                  onClick={() => {
                    console.log('Nav item clicked:', item.path);
                    if (isMobile) setOpenMobile(false);
                  }}
                />
              ))}
              
              {/* Admin Panel Link */}
              {isAdmin && (
                <NavItem 
                  item={{
                    name: "Admin Panel",
                    path: "/admin",
                    icon: <ShieldCheck className="h-5 w-5" />
                  }}
                  isActive={location.pathname === "/admin"}
                  onClick={() => {
                    if (isMobile) setOpenMobile(false);
                  }}
                />
              )}
            </nav>
            
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
      <SidebarInset className="p-4 md:p-6 bg-background/50 dark:bg-background/10 min-h-screen pt-16 md:pt-6 overflow-x-hidden w-full">
        <div className="max-w-6xl mx-auto w-full overflow-x-hidden px-0 sm:px-2">
          {children}
        </div>
      </SidebarInset>
    </div>
  );
}
