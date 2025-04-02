
import React from "react";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { 
  Home, 
  BarChart3, 
  AudioWaveform, 
  ContactIcon, 
  PhoneForwarded, 
  Server, 
  ShieldCheck,
  X,
  User,
  CreditCard,
  PhoneCall
} from "lucide-react";
import { SidebarNavItem } from "@/components/sidebar/SidebarNavItem";
import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/contexts/auth";
import { useSubscription } from "@/hooks/subscription";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Logo } from "@/components/ui/Logo";

interface DashboardSidebarProps {
  onCloseMobile?: () => void;
}

export const DashboardSidebar = ({ onCloseMobile }: DashboardSidebarProps) => {
  const { profile } = useAuth();
  const { currentPlan, subscription } = useSubscription();
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  
  // Specifically check for lifetime plan
  const isLifetimePlan = currentPlan === 'lifetime' || subscription?.plan_id === 'lifetime';
  
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
    // Remove Asterisk Config from regular navigation items
  ];
  
  // Show upgrade link only if user is not on lifetime plan
  if (!isLifetimePlan) {
    navItems.push({
      name: "Upgrade",
      path: "/upgrade",
      icon: <CreditCard className="h-5 w-5" />
    });
  }
  
  // Admin navItems - only displayed to admin users
  const adminNavItems = [
    {
      name: "Admin Panel",
      path: "/admin",
      icon: <ShieldCheck className="h-5 w-5" />
    },
    // Move Asterisk Config to admin-only items
    {
      name: "Asterisk Config",
      path: "/asterisk-config",
      icon: <PhoneCall className="h-5 w-5" />
    }
  ];
  
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="bg-primary text-white dark:bg-primary/90">
        <div className="flex items-center p-4 justify-between">
          <Logo withText={true} className="text-white" />
          
          {/* Only show close button for mobile */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20" 
              onClick={() => {
                setOpenMobile(false);
                if (onCloseMobile) onCloseMobile();
              }}
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
          
          {/* Admin Links */}
          {profile?.is_admin === true && (
            <>
              {adminNavItems.map((item) => (
                <SidebarNavItem 
                  key={item.path}
                  item={item}
                  onClick={handleItemClick}
                />
              ))}
            </>
          )}
          
          {/* Logout button */}
          <div className="border-t border-border mt-2 pt-2">
            <LogoutButton 
              variant="ghost" 
              className="w-full justify-start py-3 px-4 text-left" 
              onClick={handleItemClick}
              position="left"
            />
          </div>
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
