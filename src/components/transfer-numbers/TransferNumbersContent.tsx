
import React, { useState, useEffect, useRef } from "react";
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
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update local transfer numbers when prop changes
  useEffect(() => {
    setLocalTransferNumbers(transferNumbers);
  }, [transferNumbers]);
  
  // Force show content after a short timeout for better UX
  useEffect(() => {
    // Clear any existing timer
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    if (isLoading) {
      // Short timeout to show loading indicator
      loadingTimerRef.current = setTimeout(() => {
        setForceShowContent(true);
      }, 1000);
      
      // Longer timeout to show warning
      loadingTimerRef.current = setTimeout(() => {
        if (isLoading) {
          setLoadingTimeoutReached(true);
          
          // Auto retry after timeout
          if (localTransferNumbers.length === 0 && !error) {
            onRefresh();
          }
        }
      }, 5000);
    }
    
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [isLoading, localTransferNumbers.length, error, onRefresh]);

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
  
  // Show appropriate loading state based on conditions
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
        <div className="text-center text-muted-foreground text-sm mt-4 p-2 border rounded bg-muted/10">
          <p>Loading is taking longer than expected.</p>
          <button 
            onClick={onRefresh} 
            className="text-primary text-xs underline mt-1 focus:outline-none"
          >
            Retry
          </button>
        </div>
      )}
    </>
  );
};
