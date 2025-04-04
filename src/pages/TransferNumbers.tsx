
import React, { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTransferNumbers } from "@/hooks/useTransferNumbers";
import { useAuth } from "@/contexts/auth";
import { TransferNumbersHeader } from "@/components/transfer-numbers/TransferNumbersHeader";
import { AuthRequiredAlert } from "@/components/transfer-numbers/AuthRequiredAlert";
import { TransferNumbersContent } from "@/components/transfer-numbers/TransferNumbersContent";

const TransferNumbers = () => {
  const { 
    transferNumbers, 
    isLoading, 
    isSubmitting,
    error,
    isInitialLoad,
    addTransferNumber, 
    deleteTransferNumber,
    refreshTransferNumbers
  } = useTransferNumbers();
  
  const { isAuthenticated } = useAuth();
  
  // Load data once when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshTransferNumbers().catch(err => {
        console.error("Failed to load transfer numbers:", err);
      });
    }
  }, [isAuthenticated, refreshTransferNumbers]);
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <TransferNumbersHeader />
      </div>
      
      <AuthRequiredAlert isVisible={!isAuthenticated} />
      
      {isAuthenticated && (
        <TransferNumbersContent
          transferNumbers={transferNumbers}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          error={error}
          isInitialLoad={isInitialLoad}
          addTransferNumber={addTransferNumber}
          deleteTransferNumber={deleteTransferNumber}
          onRefresh={refreshTransferNumbers}
        />
      )}
    </DashboardLayout>
  );
};

export default TransferNumbers;
