
import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { AudioWaveform, ContactIcon, PhoneForwarded, Server, BarChart3, Home } from "lucide-react";

export function DashboardNav() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="h-4 w-4 mr-2" /> },
    { name: "Campaigns", path: "/campaign", icon: <BarChart3 className="h-4 w-4 mr-2" /> },
    { name: "Greeting Files", path: "/greetings", icon: <AudioWaveform className="h-4 w-4 mr-2" /> },
    { name: "Contact Lists", path: "/contacts", icon: <ContactIcon className="h-4 w-4 mr-2" /> },
    { name: "Transfer Numbers", path: "/transfers", icon: <PhoneForwarded className="h-4 w-4 mr-2" /> },
    { name: "SIP Providers", path: "/sip-providers", icon: <Server className="h-4 w-4 mr-2" /> },
  ];
  
  return (
    <div className="bg-card rounded-lg border p-4">
      <h2 className="font-semibold mb-4">Navigation</h2>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className="block w-full">
            <Button
              variant={isActive(item.path) ? "default" : "ghost"}
              className={`w-full justify-start ${isActive(item.path) ? "" : "hover:bg-accent"}`}
            >
              {item.icon}
              {item.name}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
}
