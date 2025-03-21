
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { addTransferNumberToDatabase } from "@/services/transferNumberService";
import { useTransferNumberValidation } from "./useTransferNumberValidation";
import { logSupabaseOperation, OperationType } from "@/utils/supabaseDebug";

export function useAddTransferNumber(
  setIsSubmitting: (submitting: boolean) => void,
  refreshTransferNumbers: () => void
) {
  const { user } = useAuth();
  const { validateTransferNumberInput } = useTransferNumberValidation();

  // Add a new transfer number
  const addTransferNumber = async (name: string, number: string, description: string) => {
    console.log("addTransferNumber hook called with:", { name, number, description });
    
    try {
      // Set submitting state at the beginning
      if (setIsSubmitting) {
        console.log("Setting isSubmitting to true");
        setIsSubmitting(true);
      }
      
      // Clean input data
      const cleanName = name.trim();
      const cleanNumber = number.trim();
      const cleanDesc = description ? description.trim() : "";
      
      if (!user) {
        console.log("No user authenticated, showing toast");
        toast({
          title: "Authentication required",
          description: "Please sign in to add transfer numbers",
          variant: "destructive",
        });
        return null;
      }
      
      if (!validateTransferNumberInput(cleanName, cleanNumber)) {
        console.log("Input validation failed");
        return null;
      }
      
      console.log("Adding transfer number for user:", user.id, {cleanName, cleanNumber, cleanDesc});
      
      // Log the operation start
      logSupabaseOperation({
        operation: OperationType.WRITE,
        table: 'transfer_numbers',
        user_id: user.id,
        success: true,
        auth_status: "AUTHENTICATED",
        data: { name: cleanName, number: cleanNumber }
      });
      
      // Make the database call
      const newTransferNumber = await addTransferNumberToDatabase(
        user.id, 
        cleanName, 
        cleanNumber, 
        cleanDesc
      );
      
      // Show success toast regardless of whether we could fetch the new record
      // as long as the insert operation succeeded
      if (newTransferNumber) {
        console.log("Successfully processed transfer number addition:", newTransferNumber);
        
        toast({
          title: "Transfer number added",
          description: `${cleanName} (${cleanNumber}) has been added successfully`,
        });
        
        // Always trigger a refresh to ensure the UI updates
        console.log("Refreshing transfer numbers list");
        refreshTransferNumbers();
        
        return newTransferNumber;
      } else {
        console.error("Failed to add transfer number - no result returned");
        toast({
          title: "Error adding transfer number",
          description: "There was a problem saving your transfer number",
          variant: "destructive",
        });
      }
      return null;
    } catch (error) {
      console.error("Error adding transfer number:", error);
      toast({
        title: "Error adding transfer number",
        description: "There was a problem saving your transfer number",
        variant: "destructive",
      });
      return null;
    } finally {
      // Short delay before resetting the submitting state to improve UX
      setTimeout(() => {
        if (setIsSubmitting) {
          console.log("Setting isSubmitting to false");
          setIsSubmitting(false);
        }
      }, 500);
    }
  };

  return {
    addTransferNumber
  };
}
