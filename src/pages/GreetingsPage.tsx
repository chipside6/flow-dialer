
import React from 'react';
import { Navbar } from "@/components/Navbar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import GreetingFiles from './GreetingFiles';
import { SidebarProvider } from "@/components/ui/sidebar";

const GreetingsFallback = () => (
  <div className="w-full h-96 flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
    <span className="text-lg">Loading greeting files...</span>
  </div>
);

const GreetingsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="min-h-screen bg-background flex flex-col w-full">
          <Navbar />
          <div className="flex flex-1 w-full max-w-full overflow-hidden">
            <DashboardLayout>
              <Suspense fallback={<GreetingsFallback />}>
                <GreetingFiles />
              </Suspense>
            </DashboardLayout>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default GreetingsPage;
