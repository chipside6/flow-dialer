
import React, { useEffect } from "react";
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
  PhoneCall,
  Smartphone
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
  
  // Check for lifetime plan OR any active subscription plan that's not a trial
  const isSubscribed = currentPlan === 'lifetime' || 
                      (subscription?.plan_id === 'lifetime' || 
                      (subscription?.status === 'active' && subscription?.plan_id !== 'trial'));
  
  const handleItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
      if (onCloseMobile) onCloseMobile();
    }
  };
  
  const handleClose = () => {
    setOpenMobile(false);
    if (onCloseMobile) onCloseMobile();
  };
  
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Campaigns", path: "/campaigns", icon: <BarChart3 className="h-5 w-5" /> },
    { name: "Audio Files", path: "/greetings", icon: <AudioWaveform className="h-5 w-5" /> },
    { name: "Leads", path: "/contacts", icon: <ContactIcon className="h-5 w-5" /> },
    { name: "Transfer Numbers", path: "/transfers", icon: <PhoneForwarded className="h-5 w-5" /> },
    { name: "GoIP Setup", path: "/goip-setup", icon: <Smartphone className="h-5 w-5" /> },
    { name: "Profile", path: "/profile", icon: <User className="h-5 w-5" /> },
  ];
  
  // Only show upgrade link if user is NOT on a paid subscription
  if (!isSubscribed) {
    navItems.push({
      name: "Upgrade",
      path: "/upgrade",
      icon: <CreditCard className="h-5 w-5" />
    });
  }
  
  // Admin navItems - only displayed to admin users
  const adminNavItems = profile?.is_admin === true ? [
    {
      name: "Admin Panel",
      path: "/admin",
      icon: <ShieldCheck className="h-5 w-5" />
    },
    {
      name: "Asterisk Configuration",
      path: "/asterisk-config",
      icon: <PhoneCall className="h-5 w-5" />
    }
  ] : [];
  
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white dark:from-indigo-800 dark:to-purple-800">
        <div className="flex items-center p-4 justify-between w-full">
          <div className="flex-shrink-0 min-w-0">
            <Logo size="md" withText={true} className="text-white" />
          </div>
          
          {/* Only show close button for mobile */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 h-10 w-10 flex-shrink-0 ml-2" 
              onClick={handleClose}
              data-sidebar-close-button
            >
              <X size={24} />
              <span className="sr-only">Close Sidebar</span>
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-3 overflow-y-auto overflow-x-hidden bg-white dark:bg-slate-800">
        <nav className="w-full flex flex-col space-y-1">
          {navItems.map((item) => (
            <SidebarNavItem 
              key={item.path}
              item={item}
              onClick={handleItemClick}
            />
          ))}
          
          {/* Admin Links */}
          {adminNavItems.length > 0 && (
            <>
              <div className="my-2 px-3">
                <p className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 mt-4 mb-2 px-2">
                  Admin
                </p>
              </div>
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
          <div className="mt-auto pt-4 w-full">
            <LogoutButton 
              variant="ghost" 
              className="w-full justify-start py-2 px-3 text-left rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" 
              onClick={handleItemClick}
              position="left"
            />
          </div>
        </nav>
      </SidebarContent>
    </Sidebar>
  );
};
