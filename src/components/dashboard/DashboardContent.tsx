
import React, { useState, useEffect, ErrorBoundary } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardCards } from "./DashboardCards";
import { EmptyCampaignState } from "./EmptyCampaignState";
import { useCampaigns } from "@/hooks/useCampaigns";
import BackgroundDialer from "@/components/BackgroundDialer";
import CampaignDashboard from "@/components/CampaignDashboard";
import { Phone, BarChart3, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { campaigns, isLoading, error } = useCampaigns();
  const { toast } = useToast();
  const [loadingProgress, setLoadingProgress] = useState(45);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [renderAttempt, setRenderAttempt] = useState(0);
  
  console.log("DashboardContent rendering attempt", renderAttempt, { 
    isLoading, 
    campaigns: campaigns?.length ? `${campaigns.length} campaigns` : "no campaigns", 
    error: error?.message 
  });
  
  // Force re-render if nothing happens for too long
  useEffect(() => {
    if (renderAttempt < 2) {
      const timeout = setTimeout(() => {
        console.log("Force re-render timeout triggered");
        setRenderAttempt(prev => prev + 1);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [renderAttempt]);
  
  useEffect(() => {
    console.log("DashboardContent mounted, loading state:", isLoading);
    if (campaigns) {
      console.log("Campaigns data available:", campaigns.length);
    }
    console.log("Error state:", error?.message);
    
    let progressInterval: NodeJS.Timeout;
    
    if (isLoading) {
      // Start progress animation
      progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + Math.random() * 5;
          return newProgress > 85 ? 85 : newProgress;
        });
      }, 800);
      
      // Add timeout to exit loading state if it takes too long
      const timeout = setTimeout(() => {
        if (isLoading) {
          setLoadingTimedOut(true);
          setLoadingProgress(100);
          toast({
            title: "Taking longer than expected",
            description: "We're having trouble loading your campaigns. You can try refreshing the page.",
            variant: "default",
          });
          clearInterval(progressInterval);
        }
      }, 10000); // 10 seconds timeout
      
      return () => {
        clearTimeout(timeout);
        clearInterval(progressInterval);
      };
    } else {
      // Reset progress when loading completes
      setLoadingProgress(100);
      setTimeout(() => setLoadingProgress(45), 500);
      clearInterval(progressInterval);
    }
    
    return () => {
      clearInterval(progressInterval);
    };
  }, [isLoading, toast, campaigns, error]);

  const handleRetry = () => {
    console.log("Retry button clicked, refreshing page");
    window.location.reload();
  };

  const renderLoadingState = () => {
    return (
      <div className="space-y-8">
        <div className="flex flex-col justify-center items-center h-64 rounded-lg border border-dashed p-8 text-center animate-fade-in">
          <div className="mb-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
          <h3 className="text-xl font-medium mb-3">Preparing your dashboard</h3>
          <p className="text-muted-foreground max-w-md mb-4">Loading your campaign data and analytics...</p>
          <Progress value={loadingProgress} className="w-64 h-2" />
          {renderAttempt > 0 && (
            <Button onClick={handleRetry} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  };
  
  const renderErrorState = () => {
    return (
      <div className="space-y-8">
        <div className="flex flex-col justify-center items-center h-64 rounded-lg border border-dashed border-destructive p-8 text-center animate-fade-in">
          <div className="mb-4 text-destructive">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-medium mb-3">Something went wrong</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            {error ? `Error: ${error.message}` : "We encountered an error while loading your campaigns."}
          </p>
          <Button onClick={handleRetry} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    try {
      if (isLoading && !loadingTimedOut) {
        console.log("Rendering loading state");
        return renderLoadingState();
      }
      
      if (error) {
        console.log("Rendering error state:", error);
        return renderErrorState();
      }

      console.log("Rendering content for tab:", activeTab, "with campaigns:", campaigns?.length || 0);
      
      // Safely check if campaigns exists before trying to access its properties
      const hasCampaigns = Array.isArray(campaigns) && campaigns.length > 0;
      
      switch (activeTab) {
        case 'dialer':
          return (
            <div className="mt-4">
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Phone className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Quick Dial Mode</h3>
                    <p className="text-muted-foreground">Make calls directly from your campaign list without manual dialing.</p>
                  </div>
                </div>
              </div>
              {hasCampaigns ? (
                <BackgroundDialer campaignId={campaigns[0]?.id} />
              ) : (
                <EmptyCampaignState />
              )}
            </div>
          );
        case 'campaigns':
          return (
            <div className="mt-4">
              <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 p-6 rounded-xl border border-green-100 dark:border-green-900">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="bg-green-500/10 p-4 rounded-full">
                    <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Campaign Management</h3>
                    <p className="text-muted-foreground">View, edit and analyze all your active calling campaigns.</p>
                  </div>
                </div>
              </div>
              <CampaignDashboard initialCampaigns={campaigns || []} />
            </div>
          );
        case 'overview':
        default:
          return hasCampaigns ? <DashboardCards /> : <EmptyCampaignState />;
      }
    } catch (error) {
      console.error("Error rendering content:", error);
      toast({
        title: "Rendering Error",
        description: "There was a problem displaying your dashboard content.",
        variant: "destructive"
      });
      return renderErrorState();
    }
  };

  return (
    <div className="space-y-4 dashboard-content-wrapper w-full max-w-full overflow-x-hidden">
      <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
    </div>
  );
};
