
import React from 'react';
import { NavItem } from "@/components/navigation/NavItem";
import { useLocation } from "react-router-dom";

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
  // Check if current path starts with item path for nested routes
  // For example, /campaign/new should highlight the Campaign nav item
  const isActive = location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path));
  
  return (
    <NavItem 
      key={item.path} 
      item={item} 
      isActive={isActive}
      onClick={onClick}
    />
  );
};
