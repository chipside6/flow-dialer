
import React from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";

const DashboardFallback = () => (
  <div className="w-full h-96 flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
    <span className="text-lg">Loading dashboard...</span>
  </div>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="min-h-screen bg-background flex flex-col w-full">
          <Navbar />
          <div className="flex flex-1 w-full max-w-full overflow-hidden">
            <DashboardLayout>
              <Suspense fallback={<DashboardFallback />}>
                <DashboardContent />
              </Suspense>
            </DashboardLayout>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
