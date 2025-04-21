
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { TransferNumber } from "@/types/transferNumber";
import { toast } from "@/components/ui/use-toast";

export const useTransferNumbers = () => {
  const { user } = useAuth();
  const [transferNumbers, setTransferNumbers] = useState<TransferNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const refreshTransferNumbers = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("transfer_numbers")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) throw error;
      
      if (data) {
        const mappedData: TransferNumber[] = data.map(item => ({
          id: item.id,
          name: item.name,
          number: item.phone_number, // Map phone_number to number
          phone_number: item.phone_number, // Keep for backwards compatibility
          description: item.description || "No description provided",
          dateAdded: new Date(item.created_at),
          callCount: item.call_count || 0
        }));
        setTransferNumbers(mappedData);
      }
    } catch (err: any) {
      console.error("Error fetching transfer numbers:", err);
      setError(err.message);
      toast({
        title: "Error loading transfer numbers",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshTransferNumbers();
  }, [refreshTransferNumbers]);

  const addTransferNumber = async (
    name: string, 
    number: string, 
    description: string
  ) => {
    if (!user?.id) return null;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("transfer_numbers")
        .insert({
          user_id: user.id,
          name,
          phone_number: number,
          description
        })
        .select();
        
      if (error) throw error;
      
      await refreshTransferNumbers();
      return data;
    } catch (err: any) {
      console.error("Error adding transfer number:", err);
      setError(err.message);
      toast({
        title: "Error adding transfer number",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTransferNumber = async (id: string) => {
    if (!user?.id) return false;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("transfer_numbers")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
        
      if (error) throw error;
      
      await refreshTransferNumbers();
      return true;
    } catch (err: any) {
      console.error("Error deleting transfer number:", err);
      setError(err.message);
      toast({
        title: "Error deleting transfer number",
        description: err.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    transferNumbers, 
    isLoading, 
    isSubmitting,
    error,
    isInitialLoad,
    addTransferNumber,
    deleteTransferNumber,
    refreshTransferNumbers
  };
};
