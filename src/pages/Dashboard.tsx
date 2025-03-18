
import React, { Suspense } from "react";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";

/**
 * Fallback component shown while dashboard content is loading
 */
const DashboardFallback = () => (
  <div className="w-full h-96 flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
    <span className="text-lg">Loading dashboard...</span>
  </div>
);

/**
 * Dashboard page that uses the DashboardLayout wrapper
 */
const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="w-full">
        <Suspense fallback={<DashboardFallback />}>
          <DashboardContent />
        </Suspense>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
