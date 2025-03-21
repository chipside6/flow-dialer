
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
  
  // Refresh the list when the page loads
  useEffect(() => {
    refreshTransferNumbers();
  }, []);
  
  // Handler for adding a transfer number with error handling
  const handleAddTransferNumber = async (name: string, number: string, description: string) => {
    try {
      const result = await addTransferNumber(name, number, description);
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
      />
    </DashboardLayout>
  );
};

export default TransferNumbers;
