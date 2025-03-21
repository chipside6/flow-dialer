
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTransferNumbers } from "@/hooks/useTransferNumbers";
import { AddTransferNumberForm } from "@/components/transfer-numbers/AddTransferNumberForm";
import { TransferNumbersList } from "@/components/transfer-numbers/TransferNumbersList";

const TransferNumbers = () => {
  const { 
    transferNumbers, 
    isLoading, 
    addTransferNumber, 
    deleteTransferNumber 
  } = useTransferNumbers();
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Transfer Numbers</h1>
      </div>
      
      <AddTransferNumberForm onAddTransferNumber={addTransferNumber} />
      
      <TransferNumbersList 
        transferNumbers={transferNumbers}
        isLoading={isLoading}
        onDeleteTransferNumber={deleteTransferNumber}
      />
    </DashboardLayout>
  );
};

export default TransferNumbers;
