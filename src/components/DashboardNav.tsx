
import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { AudioWaveform, ContactIcon, PhoneForwarded, Server, BarChart3, Home, Settings, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardNav() {
  const location = useLocation();
  const { profile, isAffiliate } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="h-5 w-5 mr-3" /> },
    { name: "Campaigns", path: "/campaign", icon: <BarChart3 className="h-5 w-5 mr-3" /> },
    { name: "Greeting Files", path: "/greetings", icon: <AudioWaveform className="h-5 w-5 mr-3" /> },
    { name: "Contact Lists", path: "/contacts", icon: <ContactIcon className="h-5 w-5 mr-3" /> },
    { name: "Transfer Numbers", path: "/transfers", icon: <PhoneForwarded className="h-5 w-5 mr-3" /> },
    { name: "SIP Providers", path: "/sip-providers", icon: <Server className="h-5 w-5 mr-3" /> },
  ];
  
  // Admin link for admin users
  const isAdmin = profile?.is_admin === true;
  
  return (
    <div className="bg-card rounded-lg border p-4">
      <h2 className="font-semibold mb-4">Navigation</h2>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className="block w-full">
            <Button
              variant={isActive(item.path) ? "default" : "ghost"}
              className={`w-full justify-start rounded-lg py-6 ${isActive(item.path) ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground"}`}
              size="lg"
            >
              {item.icon}
              {item.name}
            </Button>
          </Link>
        ))}
        
        {/* Admin Panel Link */}
        {isAdmin && (
          <Link to="/admin" className="block w-full">
            <Button
              variant={isActive("/admin") ? "default" : "ghost"}
              className={`w-full justify-start rounded-lg py-6 ${isActive("/admin") ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground"}`}
              size="lg"
            >
              <ShieldCheck className="h-5 w-5 mr-3" />
              Admin Panel
            </Button>
          </Link>
        )}
        
        {/* Show user type badge */}
        {profile?.is_affiliate && (
          <div className="mt-6 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm font-medium">Affiliate Account</p>
            <p className="text-green-600 text-xs">Full access to all features</p>
          </div>
        )}
      </nav>
    </div>
  );
}
