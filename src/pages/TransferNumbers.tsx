
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
  
  // Handle initial data loading
  useEffect(() => {
    if (!user && !isAuthLoading) {
      setInitialLoad(false);
      return;
    }
    
    // Wait for authentication before loading data
    if (!isAuthLoading && user) {
      refreshTransferNumbers().catch(err => {
        console.error("Failed to load transfer numbers:", err);
      });
      
      // Set initialLoad to false after a short delay
      const timer = setTimeout(() => {
        setInitialLoad(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, isAuthLoading, refreshTransferNumbers]);
  
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
      toast({
        title: "Refreshing data",
        description: "Your transfer numbers are being updated",
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
          timeout={5000}
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
          addTransferNumber={addTransferNumber}
          deleteTransferNumber={deleteTransferNumber}
          onRefresh={handleManualRefresh}
        />
      )}
    </DashboardLayout>
  );
};

export default TransferNumbers;
