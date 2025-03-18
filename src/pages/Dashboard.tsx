
import React, { Suspense, useEffect } from "react";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  
  useEffect(() => {
    console.log("Dashboard mounted");
    
    // Check if the component mounting is causing any errors
    try {
      // Verify DOM is ready
      if (document.readyState === "complete") {
        console.log("Document is ready");
      } else {
        console.log("Document is not yet ready:", document.readyState);
      }
    } catch (error) {
      console.error("Error in Dashboard component:", error);
      toast({
        title: "Dashboard Error",
        description: "There was a problem loading the dashboard. Please try refreshing the page.",
        variant: "destructive"
      });
    }
    
    return () => {
      console.log("Dashboard unmounted");
    };
  }, [toast]);
  
  console.log("Dashboard component rendering");
  
  // Handle rendering errors
  try {
    return (
      <DashboardLayout>
        <div className="w-full max-w-full overflow-hidden">
          <Suspense fallback={<DashboardFallback />}>
            <DashboardContent />
          </Suspense>
        </div>
      </DashboardLayout>
    );
  } catch (error) {
    console.error("Error rendering Dashboard:", error);
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h1>
        <p className="mb-4">We encountered an error while loading your dashboard.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Refresh Page
        </button>
      </div>
    );
  }
};

export default Dashboard;
