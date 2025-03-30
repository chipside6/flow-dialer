
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
  CreditCard
} from "lucide-react";
import { SidebarNavItem } from "@/components/sidebar/SidebarNavItem";
import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/contexts/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Logo } from "@/components/ui/Logo";

interface DashboardSidebarProps {
  onCloseMobile?: () => void;
}

export const DashboardSidebar = ({ onCloseMobile }: DashboardSidebarProps) => {
  const { profile } = useAuth();
  const { currentPlan } = useSubscription();
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
    { name: "Billing", path: "/billing", icon: <CreditCard className="h-5 w-5" /> },
  ];
  
  // Show upgrade link for free users
  if (currentPlan === 'free' || !currentPlan) {
    navItems.push({
      name: "Upgrade",
      path: "/upgrade",
      icon: <CreditCard className="h-5 w-5" />
    });
  }
  
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
          
          {/* Admin Panel Link */}
          {profile?.is_admin === true && (
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
              position="left"
            />
          </div>
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
