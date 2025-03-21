import React from "react";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
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
  User
} from "lucide-react";
import { SidebarNavItem } from "@/components/sidebar/SidebarNavItem";
import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardSidebarProps {
  onCloseMobile?: () => void;
}

export const DashboardSidebar = ({ onCloseMobile }: DashboardSidebarProps) => {
  const { profile } = useAuth();
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  
  const handleItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
      if (onCloseMobile) onCloseMobile();
    }
  };
  
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Campaigns", path: "/campaign", icon: <BarChart3 className="h-5 w-5" /> },
    { name: "Greeting Files", path: "/greetings", icon: <AudioWaveform className="h-5 w-5" /> },
    { name: "Contact Lists", path: "/contacts", icon: <ContactIcon className="h-5 w-5" /> },
    { name: "Transfer Numbers", path: "/transfers", icon: <PhoneForwarded className="h-5 w-5" /> },
    { name: "SIP Providers", path: "/sip-providers", icon: <Server className="h-5 w-5" /> },
    { name: "Profile", path: "/profile", icon: <User className="h-5 w-5" /> },
  ];
  
  // Add admin link for admin users
  const isAdmin = profile?.is_admin === true;
  
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="bg-[#9b87f5] text-white">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center">
            <Home size={18} className="mr-2" />
            <span className="font-semibold text-lg">Dashboard</span>
          </div>
          
          {/* Close button for mobile */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-primary/80" 
              onClick={() => setOpenMobile(false)}
            >
              <X size={20} />
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-0 py-0">
        <nav className="w-full">
          {navItems.map((item) => (
            <SidebarNavItem 
              key={item.path}
              item={item}
              onClick={handleItemClick}
            />
          ))}
          
          {/* Admin Panel Link */}
          {isAdmin && (
            <SidebarNavItem 
              item={{
                name: "Admin Panel",
                path: "/admin",
                icon: <ShieldCheck className="h-5 w-5" />
              }}
              onClick={handleItemClick}
            />
          )}
          
          {/* Logout button */}
          <div className="border-t border-border mt-2 pt-2">
            <LogoutButton 
              variant="ghost" 
              className="w-full justify-start py-3 px-4 text-left" 
              onClick={handleItemClick}
            />
          </div>
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
