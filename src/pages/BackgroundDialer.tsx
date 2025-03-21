
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const BackgroundDialer = () => {
  return (
    <DashboardLayout>
      <div className="container-fluid">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Background Dialer</h1>
        </div>
        
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <p className="text-lg">The background dialer functionality will be implemented here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BackgroundDialer;
