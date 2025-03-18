
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, useSidebar } from "@/components/ui/sidebar";
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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile } = useAuth();
  const location = useLocation();
  const { setOpenMobile, openMobile, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  
  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  }, [location.pathname, isMobile, setOpenMobile, openMobile]);
  
  // Control body overflow when sidebar is open
  useEffect(() => {
    if (isMobile) {
      if (openMobile) {
        document.body.style.overflow = 'hidden';
        document.body.classList.add('mobile-menu-open');
      } else {
        document.body.style.overflow = '';
        document.body.classList.remove('mobile-menu-open');
      }
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('mobile-menu-open');
    };
  }, [openMobile, isMobile]);
  
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
  
  const handleMenuClick = () => {
    console.log("Menu button clicked, current state:", openMobile);
    setOpenMobile(!openMobile);
  };
  
  return (
    <div className="flex flex-1 w-full overflow-x-hidden">
      {/* Mobile menu button - always visible on mobile */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-background rounded-full shadow-md mobile-menu-button" 
            onClick={handleMenuClick}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </Button>
        </div>
      )}
      
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
                onClick={() => setOpenMobile(false)}
                aria-label="Close menu"
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
                  onClick={() => isMobile && setOpenMobile(false)}
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
                  onClick={() => isMobile && setOpenMobile(false)}
                />
              )}
            </nav>
            
            {/* Logout button */}
            <div className="mt-6 pt-4 border-t border-border">
              <LogoutButton 
                variant="ghost" 
                className="w-full justify-start py-3 text-left" 
                onClick={() => isMobile && setOpenMobile(false)}
              />
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="p-0 md:p-6 bg-background/50 dark:bg-background/10 min-h-screen pt-16 md:pt-6 overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full px-4 overflow-x-hidden">
          {children}
        </div>
      </SidebarInset>
    </div>
  );
}
