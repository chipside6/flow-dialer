
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
  User, 
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
    <Sidebar 
      collapsible="offcanvas" 
      style={{
        backgroundColor: '#ffffff', 
        opacity: 1,
        visibility: 'visible',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <SidebarHeader>
        <div className="flex items-center p-4 mt-4 md:mt-0" style={{ backgroundColor: '#ffffff' }}>
          <div className="w-14 h-14 bg-[#8B5CF6] rounded-full flex items-center justify-center text-white mr-3">
            <Phone size={24} />
          </div>
          <span className="font-semibold text-xl">Flow Dialer</span>
          
          {/* Close button for mobile */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenMobile(false);
              }}
            >
              <X size={20} />
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4 py-2" style={{ backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
        <div className="rounded-lg p-2 mb-4" style={{ backgroundColor: '#ffffff' }}>
          <nav className="space-y-2" style={{ backgroundColor: '#ffffff' }}>
            {navItems.map((item) => (
              <SidebarNavItem 
                key={item.path}
                item={item}
                onClick={(e) => {
                  e && e.stopPropagation();
                  handleItemClick();
                }}
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
          </nav>
          
          {/* Logout button */}
          <div className="mt-6 pt-4 border-t border-border" style={{ backgroundColor: '#ffffff' }}>
            <LogoutButton 
              variant="ghost" 
              className="w-full justify-start py-3 text-primary font-medium" 
              onClick={handleItemClick}
            />
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
