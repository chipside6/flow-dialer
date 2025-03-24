
import React, { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTransferNumbersState } from "@/hooks/useTransferNumbersState"; // Updated import
import { useFetchTransferNumbers } from "@/hooks/useFetchTransferNumbers"; // Updated import
import { LoadingState } from "@/components/upgrade/LoadingState";
import { useToast } from "@/components/ui/use-toast";
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
    lastRefresh,
    setTransferNumbers,
    setIsLoading,
    setError,
    setIsSubmitting,
    refreshTransferNumbers,
  } = useTransferNumbersState();

  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  
  const { fetchTransferNumbers } = useFetchTransferNumbers({
    setTransferNumbers,
    setIsLoading,
    setError,
    lastRefresh, // Pass lastRefresh to trigger fetch
  });

  // Handle initial data loading
  useEffect(() => {
    const loadData = async () => {
      if (!user && !isAuthLoading) {
        return;
      }

      if (!isAuthLoading && user) {
        try {
          await fetchTransferNumbers();
        } catch (err) {
          toast({
            title: "Error",
            description: "Failed to load your transfer numbers",
            variant: "destructive"
          });
        }
      }
    };

    loadData();

    return () => {
      console.log("TransferNumbers page unmounted");
    };
  }, [user, isAuthLoading, fetchTransferNumbers, toast]);

  // Handler for manual refresh
  const handleManualRefresh = async () => {
    refreshTransferNumbers(); // Trigger the refresh
  };

  if (isAuthLoading) {
    return (
      <DashboardLayout>
        <TransferNumbersHeader />
        <LoadingState message="Checking authentication, please wait..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <TransferNumbersHeader />
      <AuthRequiredAlert isVisible={!user} />
      {user && (
        <TransferNumbersContent
          transferNumbers={transferNumbers}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          error={error}
          onRefresh={handleManualRefresh}
        />
      )}
    </DashboardLayout>
  );
};

export default TransferNumbers;
