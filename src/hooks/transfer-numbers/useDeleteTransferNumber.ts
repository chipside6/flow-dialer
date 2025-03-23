
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { deleteTransferNumberFromDatabase } from "@/services/transferNumberService";
import { supabase } from "@/integrations/supabase/client";

export function useDeleteTransferNumber(
  refreshTransferNumbers: () => void
) {
  const { user } = useAuth();
  const [error, setError] = useState<Error | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteTransferNumber = async (transferNumberId: string): Promise<boolean> => {
    console.log(`Deleting transfer number with ID: ${transferNumberId}`);
    
    // Check authentication first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session || !user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to delete transfer numbers. Please log in and try again.",
        variant: "destructive"
      });
      return false;
    }
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const success = await deleteTransferNumberFromDatabase(
        user.id,
        transferNumberId
      );
      
      if (success) {
        toast({
          title: "Transfer number deleted",
          description: "The transfer number has been deleted successfully"
        });
        
        refreshTransferNumbers();
        return true;
      } else {
        throw new Error("Failed to delete transfer number");
      }
    } catch (err: any) {
      console.error("Error deleting transfer number:", err);
      setError(err instanceof Error ? err : new Error("Failed to delete transfer number"));
      
      let errorMessage = "There was an error deleting your transfer number. Please try again.";
      
      // Handle specific error cases
      if (err.message?.includes("Authentication required")) {
        errorMessage = "Please log in to delete transfer numbers";
      } else if (err.code === "PGRST301") {
        errorMessage = "Permission denied. You don't have permission to delete this record.";
      }
      
      toast({
        title: "Error deleting transfer number",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteTransferNumber,
    isDeleting,
    error
  };
}
