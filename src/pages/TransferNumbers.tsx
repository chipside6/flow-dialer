
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTransferNumbers } from "@/hooks/useTransferNumbers";
import { AddTransferNumberForm } from "@/components/transfer-numbers/AddTransferNumberForm";
import { TransferNumbersList } from "@/components/transfer-numbers/TransferNumbersList";
import { toast } from "@/components/ui/use-toast";
import { LoadingState } from "@/components/upgrade/LoadingState";

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
  
  const [initialLoad, setInitialLoad] = useState(true);
  
  console.log("TransferNumbers page render state:", { 
    transferNumbersCount: transferNumbers.length, 
    isLoading,
    isSubmitting,
    initialLoad,
    error
  });
  
  // Force refresh the list when the page loads with retries
  useEffect(() => {
    console.log("TransferNumbers page mounted, refreshing data");
    
    // Initial load with 300ms delay to ensure component is fully mounted
    const initialTimer = setTimeout(() => {
      console.log("Performing initial refresh");
      refreshTransferNumbers();
      
      // Set initialLoad to false after a delay
      setTimeout(() => {
        setInitialLoad(false);
      }, 1000);
    }, 300);
    
    // Secondary refresh after 2 seconds as a backup
    const backupTimer = setTimeout(() => {
      console.log("Performing backup refresh");
      refreshTransferNumbers();
    }, 2000);
    
    // Clean-up
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(backupTimer);
      console.log("TransferNumbers page unmounted");
    };
  }, []);
  
  // Handler for adding a transfer number with error handling
  const handleAddTransferNumber = async (name: string, number: string, description: string) => {
    console.log("handleAddTransferNumber called with:", { name, number, description });
    
    try {
      console.log("Calling addTransferNumber...");
      const result = await addTransferNumber(name, number, description);
      console.log("addTransferNumber result:", result ? "success" : "failure");
      
      if (!result) {
        console.log("No result from addTransferNumber, manually refreshing");
        // Attempt a refresh even if the result is null
        setTimeout(() => refreshTransferNumbers(), 500);
      }
      
      return result;
    } catch (error) {
      console.error("Error in handleAddTransferNumber:", error);
      toast({
        title: "Error adding transfer number",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    }
  };
  
  // Force a refresh when manually requested
  const handleManualRefresh = () => {
    console.log("Manual refresh requested from UI");
    refreshTransferNumbers();
  };
  
  // Content to display based on loading state
  const renderContent = () => {
    // During initial load, show a dedicated loading state
    if (initialLoad && isLoading) {
      return (
        <LoadingState message="Loading your transfer numbers, please wait..." />
      );
    }
    
    return (
      <>
        <AddTransferNumberForm 
          onAddTransferNumber={handleAddTransferNumber} 
          isSubmitting={isSubmitting}
        />
        
        <TransferNumbersList 
          transferNumbers={transferNumbers}
          isLoading={isLoading}
          error={error}
          onDeleteTransferNumber={deleteTransferNumber}
          onRefresh={handleManualRefresh}
        />
      </>
    );
  };
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Transfer Numbers</h1>
      </div>
      
      {renderContent()}
    </DashboardLayout>
  );
};

export default TransferNumbers;
