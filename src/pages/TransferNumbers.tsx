
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTransferNumbers } from "@/hooks/useTransferNumbers";
import { LoadingState } from "@/components/upgrade/LoadingState";
import { useToast } from "@/components/ui/use-toast";
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
    transferNumbersCount: transferNumbers?.length || 0, 
    isLoading,
    isSubmitting,
    initialLoad,
    error,
    isAuthenticated: !!user,
    isAuthLoading
  });
  
  useEffect(() => {
    const loadData = async () => {
      console.log("TransferNumbers page mounted, loading data");

      if (!isAuthLoading && !user) {
        console.log("No authenticated user, showing login prompt");
        setInitialLoad(false);
        return;
      }

      if (user) {
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
      setInitialLoad(false);
    };

    loadData();
  }, [user, isAuthLoading, refreshTransferNumbers, toast]);

  const handleAddTransferNumber = async (name, number, description) => {
    console.log("handleAddTransferNumber called with:", { name, number, description });
    
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
      await refreshTransferNumbers();
      return result;
    } catch (err) {
      console.error("Error adding transfer number:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to add the transfer number",
        variant: "destructive"
      });
      return null;
    }
  };

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
    
    try {
      await refreshTransferNumbers();
      toast({
        title: "Refreshed",
        description: "Transfer numbers have been refreshed"
      });
    } catch (err) {
      console.error("Error refreshing transfer numbers:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to refresh transfer numbers",
        variant: "destructive"
      });
    }
  };
  
  if (isAuthLoading || initialLoad) {
    return (
      <DashboardLayout>
        <TransferNumbersHeader />
        <LoadingState message="Loading transfer numbers, please wait..." />
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <TransferNumbersHeader />
      <AuthRequiredAlert isVisible={!user} />
      {user && (
        <TransferNumbersContent
          transferNumbers={transferNumbers || []}
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

