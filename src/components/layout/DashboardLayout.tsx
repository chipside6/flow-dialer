
import React from "react";
import { DashboardNav } from "@/components/DashboardNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto border-r">
          <DashboardNav />
        </div>
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 p-4 overflow-x-hidden overflow-y-auto md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
