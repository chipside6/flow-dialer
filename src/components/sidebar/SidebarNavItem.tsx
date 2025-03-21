
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
  className?: string;
  highlightStyle?: boolean;
}

export const SidebarNavItem = ({ item, onClick, className, highlightStyle }: SidebarNavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  
  return (
    <NavItem 
      key={item.path} 
      item={item} 
      isActive={isActive}
      onClick={onClick}
      className={className}
      highlightStyle={highlightStyle}
    />
  );
};
