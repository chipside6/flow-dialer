
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
    { name: "Dashboard", path: "/dashboard", icon: <Home className="h-5 w-5 mr-3" /> },
    { name: "Campaigns", path: "/campaign", icon: <BarChart3 className="h-5 w-5 mr-3" /> },
    { name: "Greeting Files", path: "/greetings", icon: <AudioWaveform className="h-5 w-5 mr-3" /> },
    { name: "Contact Lists", path: "/contacts", icon: <ContactIcon className="h-5 w-5 mr-3" /> },
    { name: "Transfer Numbers", path: "/transfers", icon: <PhoneForwarded className="h-5 w-5 mr-3" /> },
    { name: "SIP Providers", path: "/sip-providers", icon: <Server className="h-5 w-5 mr-3" /> },
  ];
  
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
      </nav>
    </div>
  );
}
