
import React from "react";
import { 
  Home,
  BarChart3,
  AudioWaveform,
  ContactIcon,
  PhoneForwarded,
  Server,
  ShieldCheck
} from "lucide-react";
import { NavItem } from "@/components/navigation/NavItem";
import { Location } from "react-router-dom";

interface NavListProps {
  location: Location;
  isAdmin?: boolean;
  onClick?: () => void;
}

export const NavList = ({ location, isAdmin, onClick }: NavListProps) => {
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Campaigns", path: "/campaign", icon: <BarChart3 className="h-5 w-5" /> },
    { name: "Greeting Files", path: "/greetings", icon: <AudioWaveform className="h-5 w-5" /> },
    { name: "Contact Lists", path: "/contacts", icon: <ContactIcon className="h-5 w-5" /> },
    { name: "Transfer Numbers", path: "/transfers", icon: <PhoneForwarded className="h-5 w-5" /> },
    { name: "SIP Providers", path: "/sip-providers", icon: <Server className="h-5 w-5" /> },
  ];

  return (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <NavItem 
          key={item.path} 
          item={item} 
          isActive={location.pathname === item.path}
          onClick={onClick}
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
          onClick={onClick}
        />
      )}
    </nav>
  );
};
