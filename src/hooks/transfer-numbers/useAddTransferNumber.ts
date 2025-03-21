
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { addTransferNumber } from "@/services/customBackendService";

export function useAddTransferNumber(
  setIsSubmitting: (loading: boolean) => void,
  refreshTransferNumbers: () => void
) {
  const { user } = useAuth();

  // Add a new transfer number
  const addTransferNumberHandler = async (name: string, number: string, description: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add a transfer number",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      console.log("Adding transfer number:", name, number);
      setIsSubmitting(true);
      
      const newTransferNumber = await addTransferNumber(
        user.id, 
        name, 
        number, 
        description
      );
      
      console.log("Successfully added transfer number:", newTransferNumber);
      
      toast({
        title: "Transfer number added",
        description: "The new transfer number has been saved",
      });
      
      // Refresh the list to include the new item
      refreshTransferNumbers();
      
      return newTransferNumber;
    } catch (error) {
      console.error("Error adding transfer number:", error);
      toast({
        title: "Error adding transfer number",
        description: "There was a problem adding the transfer number",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    addTransferNumber: addTransferNumberHandler
  };
}
