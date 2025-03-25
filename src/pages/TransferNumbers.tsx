
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTransferNumbers } from "@/hooks/useTransferNumbers";
import { LoadingState } from "@/components/upgrade/LoadingState";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { TransferNumbersHeader } from "@/components/transfer-numbers/TransferNumbersHeader";
import { AuthRequiredAlert } from "@/components/transfer-numbers/AuthRequiredAlert";
import { TransferNumbersContent } from "@/components/transfer-numbers/TransferNumbersContent";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const TransferNumbers = () => {
  const { 
    transferNumbers, 
    isLoading, 
    isSubmitting,
    error,
    addTransferNumber, 
    deleteTransferNumber,
    refreshTransferNumbers
  } = useTransferNumbers();
  
  const { user, isLoading: isAuthLoading } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);
  const { toast } = useToast();
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  
  // Handle initial data loading
  useEffect(() => {
    const loadData = async () => {
      if (!user && !isAuthLoading) {
        setInitialLoad(false);
        return;
      }
      
      // Wait for authentication before loading data
      if (!isAuthLoading && user) {
        try {
          await refreshTransferNumbers();
        } catch (err) {
          console.error("Failed to load transfer numbers:", err);
          toast({
            title: "Error",
            description: "Failed to load your transfer numbers",
            variant: "destructive"
          });
        }
      }

      // Set initialLoad to false after a delay to ensure smoother UX
      const timer = setTimeout(() => {
        setInitialLoad(false);
      }, 800);
      
      return () => clearTimeout(timer);
    };
    
    loadData();
  }, [user, isAuthLoading, refreshTransferNumbers, toast]);
  
  // Force data refresh after multiple failed attempts
  useEffect(() => {
    if (refreshAttempts > 0) {
      const attemptRefresh = async () => {
        try {
          await refreshTransferNumbers();
          toast({
            title: "Refresh attempt",
            description: `Attempt ${refreshAttempts}: Trying to load your data again.`
          });
        } catch (err) {
          console.error("Refresh attempt failed:", err);
        }
      };
      
      attemptRefresh();
    }
  }, [refreshAttempts, refreshTransferNumbers, toast]);

  // Add automatic retry for persistent loading issues
  useEffect(() => {
    if (isLoading && !initialLoad) {
      const retryTimer = setTimeout(() => {
        // Auto-retry loading if stuck for too long
        setRefreshAttempts(prev => prev + 1);
      }, 20000); // 20 second auto-retry
      
      return () => clearTimeout(retryTimer);
    }
  }, [isLoading, initialLoad]);
  
  // Handler for adding a transfer number with improved error handling
  const handleAddTransferNumber = async (name: string, number: string, description: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to add transfer numbers",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      const result = await addTransferNumber(name, number, description);
      return result;
    } catch (err: any) {
      console.error("Error adding transfer number:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to add the transfer number",
        variant: "destructive"
      });
      return null;
    }
  };
  
  // Handler for manual refresh with error handling
  const handleManualRefresh = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to view transfer numbers",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await refreshTransferNumbers();
      // Increment refresh attempts to trigger the effect that will reload data
      setRefreshAttempts(prev => prev + 1);
      
      toast({
        title: "Refreshing data",
        description: "Transfer numbers are being refreshed"
      });
    } catch (err: any) {
      console.error("Error refreshing transfer numbers:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to refresh transfer numbers",
        variant: "destructive"
      });
    }
  };
  
  // Render authentication loading state
  if (isAuthLoading) {
    return (
      <DashboardLayout>
        <TransferNumbersHeader />
        <LoadingState 
          message="Checking authentication, please wait..." 
          timeout={8000}
        />
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <TransferNumbersHeader />
        
        {!initialLoad && user && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={isAuthLoading}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        )}
      </div>
      
      <AuthRequiredAlert isVisible={!user} />
      
      {user && (
        <TransferNumbersContent
          transferNumbers={transferNumbers}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          error={error}
          isInitialLoad={initialLoad}
          addTransferNumber={handleAddTransferNumber}
          deleteTransferNumber={deleteTransferNumber}
          onRefresh={handleManualRefresh}
        />
      )}
    </DashboardLayout>
  );
};

export default TransferNumbers;
