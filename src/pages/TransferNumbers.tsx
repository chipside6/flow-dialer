
import React, { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTransferNumbers } from "@/hooks/useTransferNumbers";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { TransferNumbersHeader } from "@/components/transfer-numbers/TransferNumbersHeader";
import { AuthRequiredAlert } from "@/components/transfer-numbers/AuthRequiredAlert";
import { TransferNumbersContent } from "@/components/transfer-numbers/TransferNumbersContent";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
  
  const { isAuthenticated } = useAuth();
  const [refreshDisabled, setRefreshDisabled] = React.useState(false);
  const { toast } = useToast();
  
  // Load data once when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshTransferNumbers().catch(err => {
        console.error("Failed to load transfer numbers:", err);
      });
    }
  }, [isAuthenticated, refreshTransferNumbers]);
  
  // Handler for manual refresh
  const handleManualRefresh = async () => {
    if (refreshDisabled) return;
    
    // Prevent multiple rapid refreshes
    setRefreshDisabled(true);
    
    try {
      await refreshTransferNumbers();
      toast({
        title: "Refreshing data",
        description: "Your transfer numbers are being updated",
      });
    } catch (err: any) {
      console.error("Error refreshing transfer numbers:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to refresh transfer numbers",
        variant: "destructive"
      });
    } finally {
      // Re-enable after a delay
      setTimeout(() => {
        setRefreshDisabled(false);
      }, 2000);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <TransferNumbersHeader />
        
        {isAuthenticated && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={refreshDisabled || isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
      
      <AuthRequiredAlert isVisible={!isAuthenticated} />
      
      {isAuthenticated && (
        <TransferNumbersContent
          transferNumbers={transferNumbers}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          error={error}
          isInitialLoad={false}
          addTransferNumber={addTransferNumber}
          deleteTransferNumber={deleteTransferNumber}
          onRefresh={handleManualRefresh}
        />
      )}
    </DashboardLayout>
  );
};

export default TransferNumbers;
