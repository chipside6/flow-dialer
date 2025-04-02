
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { deleteTransferNumber as deleteTransferNumberService } from "@/services/supabase/transferNumbersService";

export const useDeleteTransferNumber = (onSuccess: () => Promise<void>) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTransferNumber = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete a transfer number",
        variant: "destructive",
      });
      return false;
    }

    setIsDeleting(true);
    console.log(`Attempting to delete transfer number with ID: ${id}`);
    
    try {
      const result = await deleteTransferNumberService(user.id, id);
      
      // Wait for a short delay before refreshing to allow the database to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (result) {
        console.log("Successfully deleted transfer number, triggering refresh");
        
        // Call the success callback to refresh data
        await onSuccess();
        
        console.log("Data refreshed after deletion");
        
        return true;
      } else {
        console.error("Failed to delete transfer number, server returned false");
        return false;
      }
    } catch (err: any) {
      console.error("Error deleting transfer number:", err);
      toast({
        title: "Error deleting transfer number",
        description: err.message || "Failed to delete transfer number",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { handleDeleteTransferNumber, isDeleting };
};
