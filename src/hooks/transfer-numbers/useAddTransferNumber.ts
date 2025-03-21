
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { addTransferNumberToDatabase } from "@/services/transferNumberService";
import { useTransferNumberValidation } from "./useTransferNumberValidation";

export function useAddTransferNumber(
  setIsSubmitting: (submitting: boolean) => void,
  refreshTransferNumbers: () => void
) {
  const { user } = useAuth();
  const { validateTransferNumberInput } = useTransferNumberValidation();

  // Add a new transfer number
  const addTransferNumber = async (name: string, number: string, description: string) => {
    console.log("addTransferNumber hook called with:", { name, number, description });
    
    if (!user) {
      console.log("No user authenticated, showing toast");
      toast({
        title: "Authentication required",
        description: "Please sign in to add transfer numbers",
        variant: "destructive",
      });
      return null;
    }
    
    if (!validateTransferNumberInput(name, number)) {
      console.log("Input validation failed");
      return null;
    }
    
    // Prevent multiple submissions
    if (setIsSubmitting) {
      console.log("Setting isSubmitting to true");
      setIsSubmitting(true);
    }
    
    try {
      console.log("Adding transfer number for user:", user.id, {name, number, description});
      
      // Make sure we're passing clean data to the service
      const cleanName = name.trim();
      const cleanNumber = number.trim();
      const cleanDesc = description ? description.trim() : "";
      
      const newTransferNumber = await addTransferNumberToDatabase(
        user.id, 
        cleanName, 
        cleanNumber, 
        cleanDesc
      );
      
      if (newTransferNumber) {
        console.log("Successfully added transfer number:", newTransferNumber);
        
        toast({
          title: "Transfer number added",
          description: `${cleanName} (${cleanNumber}) has been added successfully`,
        });
        
        // Trigger a refresh
        refreshTransferNumbers();
        return newTransferNumber;
      } else {
        console.error("Failed to add transfer number - no result returned");
        toast({
          title: "Error adding transfer number",
          description: "The server returned an empty response",
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
      // Ensure isSubmitting is always reset
      if (setIsSubmitting) {
        console.log("Setting isSubmitting to false");
        setIsSubmitting(false);
      }
    }
  };

  return {
    addTransferNumber
  };
}
