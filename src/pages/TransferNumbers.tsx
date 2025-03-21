
import React, { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTransferNumbers } from "@/hooks/useTransferNumbers";
import { AddTransferNumberForm } from "@/components/transfer-numbers/AddTransferNumberForm";
import { TransferNumbersList } from "@/components/transfer-numbers/TransferNumbersList";
import { toast } from "@/components/ui/use-toast";

const TransferNumbers = () => {
  const { 
    transferNumbers, 
    isLoading, 
    isSubmitting,
    addTransferNumber, 
    deleteTransferNumber,
    refreshTransferNumbers
  } = useTransferNumbers();
  
  console.log("TransferNumbers page render state:", { 
    transferNumbersCount: transferNumbers.length, 
    isLoading, 
    isSubmitting 
  });
  
  // Force refresh the list when the page loads
  useEffect(() => {
    console.log("TransferNumbers page mounted, refreshing data");
    // Small timeout to ensure component is fully mounted
    const timer = setTimeout(() => {
      refreshTransferNumbers();
    }, 100);
    
    // Clean-up
    return () => {
      clearTimeout(timer);
      console.log("TransferNumbers page unmounted");
    };
  }, []);
  
  // Handler for adding a transfer number with error handling
  const handleAddTransferNumber = async (name: string, number: string, description: string) => {
    console.log("handleAddTransferNumber called with:", { name, number, description });
    
    try {
      const result = await addTransferNumber(name, number, description);
      console.log("addTransferNumber result:", result ? "success" : "failure");
      
      // No need to call refreshTransferNumbers here as it's now handled in the hook
      
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
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Transfer Numbers</h1>
      </div>
      
      <AddTransferNumberForm 
        onAddTransferNumber={handleAddTransferNumber} 
        isSubmitting={isSubmitting}
      />
      
      <TransferNumbersList 
        transferNumbers={transferNumbers}
        isLoading={isLoading}
        onDeleteTransferNumber={deleteTransferNumber}
        onRefresh={handleManualRefresh}
      />
    </DashboardLayout>
  );
};

export default TransferNumbers;
