
import React from "react";
import { useAuth } from "@/contexts/auth";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { Phone, Home, BarChart3, AudioWaveform, ContactIcon, PhoneForwarded, Server, ShieldCheck } from "lucide-react";
import { NavItem } from "@/components/navigation/NavItem";
import { useLocation } from "react-router-dom";
import LogoutButton from "@/components/LogoutButton";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  
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
  
  return (
    <div className="flex flex-1 w-full">
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          <div className="flex items-center p-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white mr-3">
              <Phone size={18} />
            </div>
            <span className="font-semibold text-lg">Flow Dialer</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-3 py-4">
          <div className="bg-card rounded-lg border shadow-sm p-4 mb-4">
            <h2 className="font-semibold mb-4 text-lg">Navigation</h2>
            <nav className="space-y-3">
              {navItems.map((item) => (
                <NavItem 
                  key={item.path} 
                  item={item} 
                  isActive={location.pathname === item.path} 
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
                />
              )}
            </nav>
            
            {/* Logout button */}
            <div className="mt-6 pt-4 border-t border-border">
              <LogoutButton variant="ghost" className="w-full justify-start py-6 text-left" />
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="p-4 md:p-6 bg-background/50 dark:bg-background/10 min-h-screen pt-16 md:pt-6">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </SidebarInset>
    </div>
  );
}
