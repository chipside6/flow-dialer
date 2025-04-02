
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { addTransferNumber } from "@/services/supabase/transferNumbersService";
import { TransferNumber } from "@/types/transferNumber";

export const useAddTransferNumber = (
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
  refreshTransferNumbers: () => Promise<void>
) => {
  const { user } = useAuth();
  
  const addTransferNumberHandler = async (
    name: string,
    number: string,
    description: string
  ): Promise<TransferNumber | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add a transfer number",
        variant: "destructive",
      });
      return null;
    }
    
    setIsSubmitting(true);
    try {
      console.log("Adding transfer number:", { name, number, description });
      const result = await addTransferNumber(user.id, name, number, description);
      
      // Wait for a short delay before refreshing to allow the database to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Explicitly refresh the transfer numbers
      await refreshTransferNumbers();
      
      // Show success message
      toast({
        title: "Transfer number added",
        description: "The transfer number has been added successfully",
      });
      
      return result;
    } catch (err: any) {
      console.error("Error adding transfer number:", err);
      toast({
        title: "Error adding transfer number",
        description: err.message || "Failed to add transfer number",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { addTransferNumber: addTransferNumberHandler };
};
