
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TransferNumberForm } from "@/components/transfer/TransferNumberForm";
import { TransferNumberTable } from "@/components/transfer/TransferNumberTable";
import { TransferNumber } from "@/types/transferNumbers";
import { toast } from "@/components/ui/use-toast";

const TransferNumbers = () => {
  const [transferNumbers, setTransferNumbers] = useState<TransferNumber[]>([
    {
      id: "1",
      name: "Sales Team",
      number: "+1-555-123-4567",
      description: "Transfer to sales department",
      dateAdded: new Date(2023, 4, 15),
      callCount: 45
    },
    {
      id: "2",
      name: "Customer Support",
      number: "+1-555-987-6543",
      description: "Transfer to support team for product issues",
      dateAdded: new Date(2023, 5, 10),
      callCount: 128
    }
  ]);
  
  const handleAddTransferNumber = (newTransferNumber: TransferNumber) => {
    setTransferNumbers([...transferNumbers, newTransferNumber]);
  };
  
  const handleDeleteTransferNumber = (id: string) => {
    setTransferNumbers(transferNumbers.filter(tn => tn.id !== id));
    toast({
      title: "Transfer number deleted",
      description: "The transfer number has been removed",
    });
  };
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Transfer Numbers</h1>
      </div>
      
      <TransferNumberForm onAddTransferNumber={handleAddTransferNumber} />
      
      <TransferNumberTable 
        transferNumbers={transferNumbers}
        onDeleteTransferNumber={handleDeleteTransferNumber}
      />
    </DashboardLayout>
  );
};

export default TransferNumbers;
