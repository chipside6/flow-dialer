
import React from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 w-full pt-16"> {/* This pt-16 creates space for the fixed navbar */}
        <DashboardLayout>
          <DashboardContent />
        </DashboardLayout>
      </div>
    </div>
  );
};

export default Dashboard;
