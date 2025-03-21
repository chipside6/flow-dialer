
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
        className={`w-full flex items-center py-3 px-4 border-b border-gray-100 ${
          isActive ? "bg-gray-50" : ""
        }`}
      >
        <span className="flex items-center justify-center w-6 h-6 mr-3">
          {item.icon}
        </span>
        <span className="font-medium">{item.name}</span>
      </div>
    </Link>
  );
}
