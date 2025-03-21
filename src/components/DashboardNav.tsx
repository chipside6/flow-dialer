
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  AudioWaveform, 
  ContactIcon, 
  PhoneForwarded, 
  Server, 
  BarChart3, 
  Home, 
  ShieldCheck,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { NavItem } from "@/components/navigation/NavItem";
import { AffiliateStatus } from "@/components/navigation/AffiliateStatus";

export function DashboardNav() {
  const location = useLocation();
  const { profile } = useAuth();
  
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Campaigns", path: "/campaign", icon: <BarChart3 className="h-5 w-5" /> },
    { name: "Greeting Files", path: "/greetings", icon: <AudioWaveform className="h-5 w-5" /> },
    { name: "Contact Lists", path: "/contacts", icon: <ContactIcon className="h-5 w-5" /> },
    { name: "Transfer Numbers", path: "/transfers", icon: <PhoneForwarded className="h-5 w-5" /> },
    { name: "SIP Providers", path: "/sip-providers", icon: <Server className="h-5 w-5" /> },
    { name: "Profile", path: "/profile", icon: <User className="h-5 w-5" /> },
  ];
  
  // Admin link for admin users
  const isAdmin = profile?.is_admin === true;
  
  return (
    <div className="bg-card rounded-lg border p-4">
      <nav className="space-y-2">
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
        
        {/* Affiliate Status Badge */}
        {profile?.is_affiliate && <AffiliateStatus />}
      </nav>
    </div>
  );
}
