
import React from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Navbar />
      <div className="flex flex-1 w-full overflow-x-hidden">
        <DashboardLayout>
          <div className="dashboard-content-wrapper">
            <DashboardContent />
          </div>
        </DashboardLayout>
      </div>
    </div>
  );
};

export default Dashboard;
