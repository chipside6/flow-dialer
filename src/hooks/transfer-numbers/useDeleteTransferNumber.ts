
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { deleteTransferNumberFromDatabase } from "@/services/transferNumberService";

export function useDeleteTransferNumber(refreshTransferNumbers: () => void) {
  const { user } = useAuth();

  // Delete a transfer number
  const deleteTransferNumber = async (id: string) => {
    if (!user) return false;
    
    try {
      console.log("Deleting transfer number:", id);
      const success = await deleteTransferNumberFromDatabase(user.id, id);
      
      if (success) {
        console.log("Successfully deleted transfer number:", id);
        
        toast({
          title: "Transfer number deleted",
          description: "The transfer number has been removed",
        });
        
        // Trigger a refresh
        refreshTransferNumbers();
      }
      
      return success;
    } catch (error) {
      console.error("Error deleting transfer number:", error);
      toast({
        title: "Error deleting transfer number",
        description: "There was a problem removing the transfer number",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    deleteTransferNumber
  };
}
