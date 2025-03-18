
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
  const isActive = location.pathname === item.path;
  
  return (
    <NavItem 
      key={item.path} 
      item={item} 
      isActive={isActive}
      onClick={onClick}
    />
  );
};
