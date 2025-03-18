
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
}

export function NavItem({ item, isActive }: NavItemProps) {
  return (
    <Link to={item.path} className="block w-full">
      <Button
        variant={isActive ? "default" : "ghost"}
        className={`w-full justify-start rounded-md py-3 mb-1 text-left ${
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-accent hover:text-primary text-foreground"
        }`}
        size="lg"
      >
        <div className="flex items-center gap-4 text-base">
          <span className="flex items-center justify-center w-8 h-8">
            {item.icon}
          </span>
          <span className="font-medium">{item.name}</span>
        </div>
      </Button>
    </Link>
  );
}
