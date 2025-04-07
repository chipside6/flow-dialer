
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
  const isActive = location.pathname === item.path;
  
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
        isActive 
          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" 
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
      }`}
    >
      <span className={`mr-3 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`}>
        {item.icon}
      </span>
      <span>{item.name}</span>
      {isActive && (
        <span className="ml-auto w-1.5 h-5 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
      )}
    </Link>
  );
};
