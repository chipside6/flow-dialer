
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export interface NavItemProps {
  item: {
    name: string;
    path: string;
    icon: React.ReactNode;
  };
  isActive: boolean;
  onClick?: () => void;
}

export function NavItem({ item, isActive, onClick }: NavItemProps) {
  return (
    <Link to={item.path} className="block w-full" onClick={onClick}>
      <Button
        variant={isActive ? "default" : "ghost"}
        className={`w-full justify-start rounded-md py-2 mb-1 text-left sidebar-nav-button ${
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-muted hover:text-primary text-foreground"
        }`}
        size="sm"
      >
        <div className="flex items-center gap-2 text-sm w-full">
          <span className="flex items-center justify-center w-5 h-5 flex-shrink-0">
            {item.icon}
          </span>
          <span className="font-medium truncate">{item.name}</span>
        </div>
      </Button>
    </Link>
  );
}
