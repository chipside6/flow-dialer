
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
  
  // Force show content after a short timeout for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && isInitialLoad) {
        setForceShowContent(true);
      }
    }, 1000); // Show content after 1 second even if still loading
    
    return () => clearTimeout(timer);
  }, [isLoading, isInitialLoad]);
  
  // If this is the initial load and we're still loading (and haven't forced content)
  if (isInitialLoad && isLoading && !forceShowContent) {
    return (
      <LoadingState 
        message="Loading your transfer numbers, please wait..." 
        timeout={5000} // 5 seconds timeout for initial load
        onRetry={onRefresh}
        errorVariant="warning"
      />
    );
  }

  return (
    <>
      <ErrorAlert error={error} onRetry={onRefresh} />
      
      {isLoading && forceShowContent && (
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Loading your transfer numbers...</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh} 
              className="ml-2"
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
