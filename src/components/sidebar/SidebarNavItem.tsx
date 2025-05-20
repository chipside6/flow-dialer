
import React from "react";
import { Link } from "react-router-dom";

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
  className?: string; // Add optional className prop
}

export const SidebarNavItem = ({ href, label, icon, isActive, onClick, className = "" }: NavItemProps) => {
  // We need to specifically track if this is the GoIP setup page for mobile CSS
  const isGoipSetup = href === "/goip-setup";
  
  return (
    <Link
      to={href}
      onClick={onClick}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors w-full ${
        isActive 
          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" 
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
      } ${isGoipSetup && isActive ? "active-goip-setup-link" : ""} ${className}`}
    >
      <div className="flex items-center w-full">
        <span className={`w-5 h-5 flex items-center justify-center mr-3 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
    </Link>
  );
};

export type { NavItemProps };
