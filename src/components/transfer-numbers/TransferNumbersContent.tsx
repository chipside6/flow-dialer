
import React, { useState, useEffect } from "react";
import { TransferNumber } from "@/types/transferNumber";
import { AddTransferNumberForm } from "./AddTransferNumberForm";
import { TransferNumbersList } from "./TransferNumbersList";
import { ErrorAlert } from "./ErrorAlert";
import { LoadingState } from "@/components/upgrade/LoadingState";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  
  // Reset timeout state when loading changes
  useEffect(() => {
    if (!isLoading) {
      setLoadingTimedOut(false);
    }
  }, [isLoading]);
  
  // Force show content after shorter timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && isInitialLoad) {
        setForceShowContent(true);
        if (isLoading) {
          toast({
            title: "Still loading data",
            description: "We're showing you the UI while data continues to load in the background"
          });
        }
      }
    }, 1500); // Reduced from 2 seconds to 1.5 seconds for faster UI feedback
    
    return () => clearTimeout(timer);
  }, [isLoading, isInitialLoad]);
  
  // Add timeout for loading state
  useEffect(() => {
    if (!isLoading) return;
    
    const longLoadingTimer = setTimeout(() => {
      if (isLoading) {
        setLoadingTimedOut(true);
        if (!forceShowContent) {
          setForceShowContent(true);
        }
        
        toast({
          title: "Loading timeout reached",
          description: "We're having trouble loading your data. You can still use the application.",
          variant: "destructive" // Changed from potentially 'warning' to 'destructive'
        });
      }
    }, 4000); // 4 seconds timeout (reduced from 5s)
    
    return () => clearTimeout(longLoadingTimer);
  }, [isLoading, forceShowContent]);
  
  // During initial load, show a dedicated loading state for a shorter time
  if (isInitialLoad && isLoading && !forceShowContent) {
    return (
      <LoadingState 
        message="Loading your transfer numbers, please wait..." 
        timeout={1500} // 1.5 seconds timeout (reduced from 2s)
        onRetry={onRefresh}
      />
    );
  }

  return (
    <>
      <ErrorAlert error={error} onRetry={onRefresh} />
      
      {loadingTimedOut && isLoading && (
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-800 flex items-center justify-between w-full">
            <span>Loading is taking longer than expected. You can continue to use the application.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh} 
              className="ml-2 bg-amber-50"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <AddTransferNumberForm 
        onAddTransferNumber={addTransferNumber} 
        isSubmitting={isSubmitting}
      />
      
      <TransferNumbersList 
        transferNumbers={transferNumbers}
        isLoading={isLoading && !isInitialLoad && !forceShowContent}
        error={error}
        onDeleteTransferNumber={deleteTransferNumber}
        onRefresh={onRefresh}
      />
      
      {isLoading && forceShowContent && (
        <div className="mt-4 flex items-center justify-center py-2">
          <Loader2 className="h-5 w-5 text-primary mr-2 animate-spin" />
          <span className="text-muted-foreground">Refreshing data...</span>
        </div>
      )}
    </>
  );
};
