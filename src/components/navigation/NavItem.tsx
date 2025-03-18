
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
        className={`w-full justify-start rounded-lg py-6 ${
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-accent text-foreground"
        }`}
        size="lg"
      >
        {item.icon}
        {item.name}
      </Button>
    </Link>
  );
}
