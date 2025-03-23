
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
      <div
        className={`w-full flex items-center py-3 px-4 border-b border-gray-100 transition-colors duration-200 
          ${isActive 
            ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground" 
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
      >
        <span className={`flex items-center justify-center w-6 h-6 mr-3 ${isActive ? "text-primary" : ""}`}>
          {item.icon}
        </span>
        <span className={`font-medium ${isActive ? "text-primary" : ""}`}>{item.name}</span>
      </div>
    </Link>
  );
}
