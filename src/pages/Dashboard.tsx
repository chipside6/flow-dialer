
import React from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardNav } from "@/components/DashboardNav";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { Phone } from "lucide-react";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarInset
} from "@/components/ui/sidebar";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <SidebarProvider defaultOpen>
        <div className="flex flex-1 w-full pt-16">
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
              <DashboardContent />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
