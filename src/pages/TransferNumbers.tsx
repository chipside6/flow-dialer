
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTransferNumbers } from "@/hooks/useTransferNumbers";
import { AddTransferNumberForm } from "@/components/transfer-numbers/AddTransferNumberForm";
import { TransferNumbersList } from "@/components/transfer-numbers/TransferNumbersList";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LoadingState } from "@/components/upgrade/LoadingState";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tryCatchWithErrorHandling, DialerErrorType } from "@/utils/errorHandlingUtils";

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
  const { toast } = useToast();
  
  console.log("TransferNumbers page render state:", { 
    transferNumbersCount: transferNumbers.length, 
    isLoading,
    isSubmitting,
    initialLoad,
    error
  });
  
  // Handle initial data loading with better error handling
  useEffect(() => {
    const loadData = async () => {
      console.log("TransferNumbers page mounted, loading data");
      
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
  }, []);
  
  // Handler for adding a transfer number with improved error handling
  const handleAddTransferNumber = async (name: string, number: string, description: string) => {
    console.log("handleAddTransferNumber called with:", { name, number, description });
    
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
  
  // Render error state
  const renderError = () => {
    if (!error) return null;
    
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error loading transfer numbers</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualRefresh} 
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </Alert>
    );
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
        {renderError()}
        
        <AddTransferNumberForm 
          onAddTransferNumber={handleAddTransferNumber} 
          isSubmitting={isSubmitting}
        />
        
        <TransferNumbersList 
          transferNumbers={transferNumbers}
          isLoading={isLoading && !initialLoad}
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
        <p className="text-muted-foreground mt-2">
          Add and manage transfer numbers for your call campaigns.
        </p>
      </div>
      
      {renderContent()}
    </DashboardLayout>
  );
};

export default TransferNumbers;
