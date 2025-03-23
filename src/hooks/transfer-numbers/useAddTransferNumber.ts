
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { addTransferNumberToDatabase } from "@/services/transferNumberService";
import { TransferNumber } from "@/types/transferNumber";

export function useAddTransferNumber(
  setIsSubmitting: (isSubmitting: boolean) => void,
  refreshTransferNumbers: () => void
) {
  const { user } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  const addTransferNumber = async (
    name: string,
    number: string,
    description: string
  ): Promise<TransferNumber | null> => {
    console.log(`Adding transfer number: ${name} ${number}`);
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to add transfer numbers",
        variant: "destructive"
      });
      return null;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await addTransferNumberToDatabase(
        user.id,
        name,
        number,
        description
      );
      
      if (result) {
        toast({
          title: "Transfer number added",
          description: `${name} has been added to your transfer numbers`
        });
        
        refreshTransferNumbers();
        return result;
      } else {
        // No error but no result either
        console.log("No result returned from addTransferNumberToDatabase");
        refreshTransferNumbers();
        return null;
      }
    } catch (err) {
      console.error("Error adding transfer number:", err);
      setError(err instanceof Error ? err : new Error("Failed to add transfer number"));
      
      toast({
        title: "Error adding transfer number",
        description: "There was an error adding your transfer number. Please try again.",
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    addTransferNumber,
    error
  };
}
