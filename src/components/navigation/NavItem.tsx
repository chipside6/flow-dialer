
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItemProps {
  item: {
    name: string;
    path: string;
    icon: React.ReactNode;
  };
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  highlightStyle?: boolean;
}

export const NavItem = ({ item, isActive, onClick, className, highlightStyle }: NavItemProps) => {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(className, "block")}
    >
      <div
        className={cn(
          "flex items-center py-2 px-4 gap-3 hover:bg-gray-50 text-sm",
          isActive && "bg-gray-50 font-medium",
          highlightStyle && "bg-primary/10 hover:bg-primary/20 border-l-4 border-primary"
        )}
      >
        <span>{item.icon}</span>
        <span>{item.name}</span>
      </div>
    </Link>
  );
};
