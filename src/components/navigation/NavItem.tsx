
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function NavItem({ to, icon, children, className }: NavItemProps) {
  return (
    <Link to={to} className={`block w-full ${className || ''}`}>
      <div className="w-full flex items-center py-3 px-4 border-b border-gray-100 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
        <span className="flex items-center justify-center w-6 h-6 mr-3">
          {icon}
        </span>
        <span className="font-medium">{children}</span>
      </div>
    </Link>
  );
}
