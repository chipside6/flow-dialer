
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
      
      if (result) {
        console.log("Successfully added transfer number:", result);
        
        // Wait for a short delay to ensure database consistency
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log("Refreshing transfer numbers list after successful add");
        // Explicitly refresh the transfer numbers
        await refreshTransferNumbers();
        
        // Show success message
        toast({
          title: "Transfer number added",
          description: "The transfer number has been added successfully",
        });
        
        return result;
      } else {
        console.error("Failed to add transfer number, server returned null/undefined");
        toast({
          title: "Error adding transfer number",
          description: "Server returned an invalid response",
          variant: "destructive"
        });
        return null;
      }
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
