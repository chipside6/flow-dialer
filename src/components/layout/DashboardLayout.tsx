
import React from "react";
import { DashboardNav } from "@/components/DashboardNav";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset } from "@/components/ui/sidebar";
import { Phone } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex flex-1 w-full">
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          <div className="flex items-center p-2">
            <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white mr-2">
              <Phone size={16} />
            </span>
            <span className="font-semibold text-lg">Flow Dialer</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <DashboardNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="p-6">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </SidebarInset>
    </div>
  );
}
