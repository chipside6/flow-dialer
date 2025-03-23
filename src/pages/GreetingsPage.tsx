
import React from 'react';
import { Navbar } from "@/components/Navbar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import GreetingFiles from './GreetingFiles';

const GreetingsFallback = () => (
  <div className="w-full h-96 flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
    <span className="text-lg">Loading greeting files...</span>
  </div>
);

const GreetingsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <DashboardLayout>
        <div className="w-full">
          {/* Removed the Suspense wrapper that was causing loading to get stuck */}
          <GreetingFiles />
        </div>
      </DashboardLayout>
    </div>
  );
};

export default GreetingsPage;
