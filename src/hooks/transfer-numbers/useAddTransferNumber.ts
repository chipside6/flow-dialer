
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { addTransferNumber } from "@/services/supabase/transferNumbersService";

export const useAddTransferNumber = (
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
  refreshTransferNumbers: () => Promise<void>
) => {
  const { user } = useAuth();
  
  const addTransferNumberHandler = async (
    name: string,
    number: string,
    description: string
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add a transfer number",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addTransferNumber(user.id, name, number, description);
      toast({
        title: "Transfer number added",
        description: "The transfer number has been added successfully",
      });
    } catch (err: any) {
      console.error("Error adding transfer number:", err);
      toast({
        title: "Error adding transfer number",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      await refreshTransferNumbers();
    }
  };
  
  return { addTransferNumber: addTransferNumberHandler };
};
