
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { deleteTransferNumber } from "@/services/supabase/transferNumbersService";

export const useDeleteTransferNumber = (
  refreshTransferNumbers: () => Promise<void>
) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  
  const handleDeleteTransferNumber = async (transferNumberId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete a transfer number",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsDeleting(true);
      await deleteTransferNumber(user.id, transferNumberId);
      
      toast({
        title: "Transfer number deleted",
        description: "The transfer number has been removed",
      });
      
      await refreshTransferNumbers();
      return true;
    } catch (err: any) {
      console.error("Error deleting transfer number:", err);
      toast({
        title: "Error deleting transfer number",
        description: err.message || "Failed to delete transfer number",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  
  return { handleDeleteTransferNumber, isDeleting };
};
