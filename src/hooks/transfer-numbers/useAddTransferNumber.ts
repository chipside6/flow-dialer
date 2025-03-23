
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { addTransferNumberToDatabase } from "@/services/transferNumberService";
import { TransferNumber } from "@/types/transferNumber";
import { useTransferNumberValidation } from "./useTransferNumberValidation";
import { supabase } from "@/integrations/supabase/client";

export function useAddTransferNumber(
  setIsSubmitting: (isSubmitting: boolean) => void,
  refreshTransferNumbers: () => void
) {
  const { user } = useAuth();
  const [error, setError] = useState<Error | null>(null);
  const { validateTransferNumberInput } = useTransferNumberValidation();

  const addTransferNumber = async (
    name: string,
    number: string,
    description: string
  ): Promise<TransferNumber | null> => {
    console.log(`Adding transfer number: ${name} ${number}`);
    
    // Check authentication first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session || !user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to add transfer numbers. Please log in and try again.",
        variant: "destructive"
      });
      return null;
    }
    
    // Validate the input first
    const validationResult = validateTransferNumberInput(name, number);
    if (!validationResult) {
      console.log("Validation failed for transfer number");
      return null;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Calling addTransferNumberToDatabase with:", { user: user.id, name, number, description });
      
      const result = await addTransferNumberToDatabase(
        user.id,
        name,
        number,
        description
      );
      
      if (result) {
        console.log("Successfully added transfer number:", result);
        toast({
          title: "Transfer number added",
          description: `${name} has been added to your transfer numbers`
        });
        
        refreshTransferNumbers();
        return result;
      } else {
        console.log("No result returned from addTransferNumberToDatabase");
        toast({
          title: "Error adding transfer number",
          description: "The transfer number could not be added. Please try again.",
          variant: "destructive"
        });
        refreshTransferNumbers();
        return null;
      }
    } catch (err: any) {
      console.error("Error adding transfer number:", err);
      setError(err instanceof Error ? err : new Error("Failed to add transfer number"));
      
      let errorMessage = "There was an error adding your transfer number. Please try again.";
      
      // Handle specific error cases
      if (err.message?.includes("Authentication required")) {
        errorMessage = "Please log in to add transfer numbers";
      } else if (err.code === "PGRST301") {
        errorMessage = "Permission denied. You don't have permission to add records.";
      } else if (err.code === "23505") {
        errorMessage = "This transfer number already exists.";
      }
      
      toast({
        title: "Error adding transfer number",
        description: errorMessage,
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
