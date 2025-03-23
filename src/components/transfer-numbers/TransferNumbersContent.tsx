
import React from "react";
import { TransferNumber } from "@/types/transferNumber";
import { AddTransferNumberForm } from "./AddTransferNumberForm";
import { TransferNumbersList } from "./TransferNumbersList";
import { ErrorAlert } from "./ErrorAlert";
import { LoadingState } from "@/components/upgrade/LoadingState";

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
  // During initial load, show a dedicated loading state
  if (isInitialLoad && isLoading) {
    return (
      <LoadingState message="Loading your transfer numbers, please wait..." />
    );
  }

  return (
    <>
      <ErrorAlert error={error} onRetry={onRefresh} />
      
      <AddTransferNumberForm 
        onAddTransferNumber={addTransferNumber} 
        isSubmitting={isSubmitting}
      />
      
      <TransferNumbersList 
        transferNumbers={transferNumbers}
        isLoading={isLoading && !isInitialLoad}
        error={error}
        onDeleteTransferNumber={deleteTransferNumber}
        onRefresh={onRefresh}
      />
    </>
  );
};
