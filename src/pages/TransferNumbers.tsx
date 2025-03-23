
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTransferNumbers } from "@/hooks/useTransferNumbers";
import { LoadingState } from "@/components/upgrade/LoadingState";
import { useToast } from "@/components/ui/use-toast";
import { tryCatchWithErrorHandling, DialerErrorType } from "@/utils/errorHandlingUtils";
import { useAuth } from "@/contexts/auth";
import { TransferNumbersHeader } from "@/components/transfer-numbers/TransferNumbersHeader";
import { AuthRequiredAlert } from "@/components/transfer-numbers/AuthRequiredAlert";
import { TransferNumbersContent } from "@/components/transfer-numbers/TransferNumbersContent";

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
  
  console.log("TransferNumbers page render state:", { 
    transferNumbersCount: transferNumbers.length, 
    isLoading,
    isSubmitting,
    initialLoad,
    error,
    isAuthenticated: !!user,
    isAuthLoading
  });
  
  // Handle initial data loading with better error handling
  useEffect(() => {
    const loadData = async () => {
      console.log("TransferNumbers page mounted, loading data");
      
      if (!user && !isAuthLoading) {
        console.log("No authenticated user, showing login prompt");
        setInitialLoad(false);
        return;
      }
      
      await tryCatchWithErrorHandling(
        async () => {
          await refreshTransferNumbers();
          return true;
        },
        "Failed to load your transfer numbers",
        DialerErrorType.SERVER
      );

      // Set initialLoad to false after a delay to ensure smoother UX
      setTimeout(() => {
        setInitialLoad(false);
      }, 800);
    };
    
    loadData();
    
    return () => {
      console.log("TransferNumbers page unmounted");
    };
  }, [user, isAuthLoading]);
  
  // Handler for adding a transfer number with improved error handling
  const handleAddTransferNumber = async (name: string, number: string, description: string) => {
    console.log("handleAddTransferNumber called with:", { name, number, description });
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to add transfer numbers",
        variant: "destructive"
      });
      return null;
    }
    
    const result = await tryCatchWithErrorHandling(
      async () => {
        return await addTransferNumber(name, number, description);
      },
      "Failed to add the transfer number",
      DialerErrorType.SERVER
    );
    
    // If no result but no error was thrown, try refreshing
    if (result === null) {
      console.log("No result from addTransferNumber, manually refreshing");
      setTimeout(() => refreshTransferNumbers(), 500);
    }
    
    return result;
  };
  
  // Handler for manual refresh with error handling
  const handleManualRefresh = async () => {
    console.log("Manual refresh requested from UI");
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to view transfer numbers",
        variant: "destructive"
      });
      return;
    }
    
    await tryCatchWithErrorHandling(
      async () => {
        await refreshTransferNumbers();
        toast({
          title: "Refreshed",
          description: "Transfer numbers have been refreshed"
        });
        return true;
      },
      "Failed to refresh transfer numbers",
      DialerErrorType.SERVER
    );
  };
  
  // Render authentication loading state
  if (isAuthLoading) {
    return (
      <DashboardLayout>
        <TransferNumbersHeader />
        <LoadingState message="Checking authentication, please wait..." />
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <TransferNumbersHeader />
      
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
