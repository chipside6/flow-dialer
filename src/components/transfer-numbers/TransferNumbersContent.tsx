
import React, { useState, useEffect } from "react";
import { TransferNumber } from "@/types/transferNumber";
import { AddTransferNumberForm } from "./AddTransferNumberForm";
import { TransferNumbersList } from "./TransferNumbersList";
import { ErrorAlert } from "./ErrorAlert";
import { LoadingState } from "@/components/upgrade/LoadingState";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  const [loadingTimeoutReached, setLoadingTimeoutReached] = useState(false);
  
  // Update local transfer numbers when prop changes
  useEffect(() => {
    setLocalTransferNumbers(transferNumbers);
  }, [transferNumbers]);
  
  // Force show content after a short timeout for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setForceShowContent(true);
        setLoadingTimeoutReached(true);
      }
    }, 3000); // Show content after 3 seconds even if still loading
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Reset loading timeout state whenever loading state changes
  useEffect(() => {
    if (!isLoading) {
      setLoadingTimeoutReached(false);
    }
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
        
        // Request a refresh for the latest data
        setTimeout(() => {
          onRefresh();
        }, 800);
      } else {
        // If failed, remove the optimistic entry
        setLocalTransferNumbers(prev => prev.filter(tn => tn.id !== tempId));
      }
      
      return result;
    } catch (error) {
      console.error("Error adding transfer number:", error);
      
      // Remove the optimistic entry on error
      setLocalTransferNumbers(transferNumbers);
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
      } else {
        // Request a refresh after successful deletion
        setTimeout(() => {
          onRefresh();
        }, 800);
      }
      
      return result;
    } catch (error) {
      console.error("Error deleting transfer number:", error);
      
      // Revert the optimistic update on error
      setLocalTransferNumbers(transferNumbers);
      return false;
    }
  };
  
  // Show simple loading indicator for very quick loads (under 3 seconds)
  if (isLoading && !forceShowContent && localTransferNumbers.length === 0) {
    return (
      <Card className="mb-8">
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </CardContent>
      </Card>
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
        isLoading={isLoading && localTransferNumbers.length === 0}
        error={error}
        onDeleteTransferNumber={handleDeleteTransferNumber}
        onRefresh={onRefresh}
      />
      
      {/* Show an indicator if loading is taking too long */}
      {isLoading && loadingTimeoutReached && transferNumbers.length === 0 && (
        <div className="text-center text-muted-foreground text-sm mt-4">
          Loading is taking longer than expected. Please wait...
        </div>
      )}
    </>
  );
};
