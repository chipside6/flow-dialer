
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth';

export function useDashboard() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { campaigns, isLoading, error, refreshCampaigns } = useCampaigns();
  const { isOnline } = useNetworkStatus();
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // Enhanced debug logging
  useEffect(() => {
    console.log("Dashboard - Auth status:", { isAuthenticated, userId: user?.id });
    console.log("Dashboard - Campaigns:", campaigns);
    console.log("Dashboard - Loading state:", isLoading);
    console.log("Dashboard - Error:", error);
  }, [campaigns, isLoading, error, isAuthenticated, user]);
  
  // Handle retry with exponential backoff
  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    const newCount = retryCount + 1;
    
    // Add a delay with exponential backoff (0, 1s, 2s, 4s...)
    if (newCount > 1) {
      const delay = Math.min(Math.pow(2, newCount - 2) * 1000, 5000);
      toast({
        title: "Retrying...",
        description: `Retrying in ${delay/1000} seconds`,
      });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    refreshCampaigns();
  };
  
  const handleCreateCampaign = () => {
    navigate('/campaign', { state: { showCreateWizard: true } });
  };
  
  // Add a refresh function explicitly for the dashboard
  const handleRefreshCampaigns = async () => {
    try {
      toast({
        title: "Refreshing campaigns",
        description: "Please wait while we update your campaign data..."
      });
      
      const success = await refreshCampaigns();
      
      if (success) {
        toast({
          title: "Campaigns refreshed",
          description: "Your campaign list has been updated."
        });
      }
    } catch (error) {
      console.error("Error refreshing campaigns:", error);
      toast({
        title: "Refresh failed",
        description: "There was a problem refreshing campaign data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    activeTab,
    setActiveTab,
    campaigns,
    isLoading,
    error,
    isOnline,
    isAuthenticated,
    handleRetry,
    handleCreateCampaign,
    handleRefreshCampaigns
  };
}
