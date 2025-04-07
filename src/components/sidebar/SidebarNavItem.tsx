
import React from "react";
import { Link, useLocation } from "react-router-dom";

interface NavItemProps {
  item: {
    name: string;
    path: string;
    icon: React.ReactNode;
  };
  onClick?: () => void;
}

export const SidebarNavItem = ({ item, onClick }: NavItemProps) => {
  const location = useLocation();
  
  // Check for exact match or if the path is a parent route
  // Example: /greetings should be active when the route is /greetings or /greetings/*
  const isActive = location.pathname === item.path || 
                  (item.path !== "/" && location.pathname.startsWith(item.path));
  
  // We need to specifically track if this is the GoIP setup page for mobile CSS
  const isGoipSetup = item.path === "/goip-setup";
  
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors w-full ${
        isActive 
          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" 
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
      } ${isGoipSetup && isActive ? "active-goip-setup-link" : ""}`}
    >
      <div className="flex items-center w-full">
        <span className={`w-5 h-5 flex items-center justify-center mr-3 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`}>
          {item.icon}
        </span>
        <span>{item.name}</span>
      </div>
    </Link>
  );
};
