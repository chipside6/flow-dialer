
import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  item: {
    name: string;
    path: string;
    icon: React.ReactNode;
  };
  onClick?: () => void;
}

export const SidebarNavItem = ({ item, onClick }: SidebarNavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(
        "flex items-center px-4 py-3 rounded-md text-foreground hover:bg-muted transition-colors",
        isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent"
      )}
    >
      <span className="mr-3">{item.icon}</span>
      <span className="font-medium">{item.name}</span>
    </Link>
  );
};
