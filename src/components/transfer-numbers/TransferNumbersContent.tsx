
import React, { useState, useEffect } from "react";
import { TransferNumber } from "@/types/transferNumber";
import { AddTransferNumberForm } from "./AddTransferNumberForm";
import { TransferNumbersList } from "./TransferNumbersList";
import { ErrorAlert } from "./ErrorAlert";
import { LoadingState } from "@/components/upgrade/LoadingState";
import { toast } from "@/components/ui/use-toast";

interface TransferNumbersContentProps {
  transferNumbers: TransferNumber[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  isInitialLoad: boolean;
  addTransferNumber: (name: string, number: string, description: string) => Promise<any>;
  deleteTransferNumber: (id: string) => Promise<boolean>;
  onRefresh: () => void;
}

export const TransferNumbersContent = ({
  transferNumbers,
  isLoading,
  isSubmitting,
  error,
  isInitialLoad,
  addTransferNumber,
  deleteTransferNumber,
  onRefresh
}: TransferNumbersContentProps) => {
  const [forceShowContent, setForceShowContent] = useState(false);
  const [localTransferNumbers, setLocalTransferNumbers] = useState<TransferNumber[]>(transferNumbers);
  
  // Update local transfer numbers when prop changes
  useEffect(() => {
    setLocalTransferNumbers(transferNumbers);
  }, [transferNumbers]);
  
  // Force show content after a short timeout for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setForceShowContent(true);
      }
    }, 3000); // Show content after 3 seconds even if still loading
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  // Handle adding a transfer number with optimistic update
  const handleAddTransferNumber = async (name: string, number: string, description: string) => {
    try {
      // Generate a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      
      // Optimistically add the new transfer number to the local state
      const optimisticNewNumber: TransferNumber = {
        id: tempId,
        name,
        number,
        description: description || "No description provided",
        dateAdded: new Date(),
        callCount: 0
      };
      
      // Add to local state immediately for optimistic UI update
      setLocalTransferNumbers(prev => [optimisticNewNumber, ...prev]);
      
      // Call the actual API to add the transfer number
      const result = await addTransferNumber(name, number, description);
      
      if (result) {
        console.log("Successfully added transfer number, server returned:", result);
        
        // Replace the temporary entry with the real one from the server
        setLocalTransferNumbers(prev => 
          prev.map(tn => tn.id === tempId ? {
            ...result,
            dateAdded: new Date(result.dateAdded)
          } : tn)
        );
        
        // Force refresh after a short delay to get the real data from the server
        setTimeout(() => {
          console.log("Triggering refresh after add");
          onRefresh();
        }, 800);
      } else {
        // If failed, remove the optimistic entry
        setLocalTransferNumbers(prev => prev.filter(tn => tn.id !== tempId));
        toast({
          title: "Error adding transfer number",
          description: "Server returned an invalid response",
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error adding transfer number:", error);
      toast({
        title: "Error adding transfer number",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      return null;
    }
  };
  
  // Handle deleting a transfer number with optimistic update
  const handleDeleteTransferNumber = async (id: string) => {
    try {
      // Save the current state for potential rollback
      const previousState = [...localTransferNumbers];
      
      // Optimistically remove the transfer number from the local state
      setLocalTransferNumbers(prev => prev.filter(tn => tn.id !== id));
      
      const result = await deleteTransferNumber(id);
      
      // If the deletion failed, revert the optimistic update
      if (!result) {
        setLocalTransferNumbers(previousState);
        toast({
          title: "Error deleting transfer number",
          description: "Failed to delete the transfer number",
          variant: "destructive"
        });
      } else {
        // Force refresh after a short delay to get the real data from the server
        setTimeout(() => {
          console.log("Triggering refresh after delete");
          onRefresh();
        }, 800);
      }
      
      return result;
    } catch (error) {
      console.error("Error deleting transfer number:", error);
      // Revert the optimistic update on error
      setLocalTransferNumbers(transferNumbers);
      toast({
        title: "Error deleting transfer number",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // If we're loading but have forced showing content or have numbers already
  if (isLoading && !forceShowContent && transferNumbers.length === 0) {
    return (
      <LoadingState 
        message="Loading your transfer numbers, please wait..." 
        timeout={5000} // 5 seconds timeout
        onRetry={onRefresh}
        errorVariant="warning"
      />
    );
  }

  return (
    <>
      <ErrorAlert error={error} onRetry={onRefresh} />
      
      <AddTransferNumberForm 
        onAddTransferNumber={handleAddTransferNumber} 
        isSubmitting={isSubmitting}
      />
      
      <TransferNumbersList 
        transferNumbers={localTransferNumbers}
        isLoading={isLoading && transferNumbers.length === 0 && !forceShowContent}
        error={error}
        onDeleteTransferNumber={handleDeleteTransferNumber}
        onRefresh={onRefresh}
      />
    </>
  );
};
