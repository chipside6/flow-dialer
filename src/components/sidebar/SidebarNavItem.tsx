
import React, { ReactNode } from 'react';
import { NavItem } from "@/components/navigation/NavItem";
import { useLocation } from "react-router-dom";
import { LucideIcon } from 'lucide-react';

interface SidebarNavItemProps {
  to: string;
  icon: LucideIcon;
  children: ReactNode;
}

export const SidebarNavItem = ({ to, icon, children }: SidebarNavItemProps) => {
  const location = useLocation();
  // Check if current path starts with item path for nested routes
  // For example, /campaign/new should highlight the Campaign nav item
  const isActive = location.pathname === to || 
                  (to !== '/' && location.pathname.startsWith(to));
  
  const item = {
    name: typeof children === 'string' ? children : 'Menu Item',
    path: to,
    icon: React.createElement(icon)
  };
  
  return (
    <NavItem 
      item={item} 
      isActive={isActive}
    />
  );
};
