
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Campaign } from "@/hooks/useCampaigns";
import { CampaignTable } from "@/components/campaigns/CampaignTable";
import { CampaignDetails } from "@/components/campaigns/CampaignDetails";
import { CampaignStats } from "@/components/campaigns/CampaignStats";
import { CampaignProvider, useCampaignContext } from "@/contexts/campaign/CampaignContext";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyCampaignState } from "@/components/dashboard/EmptyCampaignState";

interface CampaignDashboardProps {
  initialCampaigns?: Campaign[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

// Inner component that uses the context
const CampaignDashboardContent = ({ 
  onRefresh, 
  isLoading 
}: { 
  onRefresh?: () => void;
  isLoading?: boolean;
}) => {
  const { selectedCampaign, campaigns } = useCampaignContext();
  const { isOnline } = useNetworkStatus();
  
  // Improved logging for debugging
  useEffect(() => {
    console.log("CampaignDashboardContent - campaigns:", campaigns);
    console.log("CampaignDashboardContent - selectedCampaign:", selectedCampaign);
    console.log("CampaignDashboardContent - isLoading:", isLoading);
    console.log("CampaignDashboardContent - isOnline:", isOnline);
  }, [campaigns, selectedCampaign, isLoading, isOnline]);

  // Show network offline alert if applicable
  if (!isOnline) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You appear to be offline. Please check your network connection and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden campaign-dashboard">
      <Card className="w-full overflow-hidden">
        <CardHeader className="bg-muted/40 px-4 py-3 flex flex-row justify-between items-center">
          <CardTitle className="text-base md:text-lg">Active Campaigns</CardTitle>
          {onRefresh && (
            <Button 
              onClick={onRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="text-xs"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          <div className="w-full overflow-x-auto campaign-table-container">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Loading campaigns...</span>
              </div>
            ) : (
              <CampaignTable />
            )}
          </div>
        </CardContent>
      </Card>

      {selectedCampaign && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-full overflow-hidden">
          <CampaignDetails campaign={selectedCampaign} />
          <CampaignStats campaign={selectedCampaign} />
        </div>
      )}
    </div>
  );
};

// Wrapper component that provides the context
const CampaignDashboard = ({ 
  initialCampaigns = [], 
  onRefresh,
  isLoading 
}: CampaignDashboardProps) => {
  // Improved logging to see what data is being passed in
  useEffect(() => {
    console.log("CampaignDashboard initialCampaigns:", initialCampaigns);
    console.log("CampaignDashboard isLoading:", isLoading);
    console.log("CampaignDashboard campaigns length:", initialCampaigns?.length || 0);
  }, [initialCampaigns, isLoading]);
  
  return (
    <CampaignProvider initialCampaigns={initialCampaigns}>
      <CampaignDashboardContent onRefresh={onRefresh} isLoading={isLoading} />
    </CampaignProvider>
  );
};

export default CampaignDashboard;
