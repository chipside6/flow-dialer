
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";

export interface TransferNumber {
  id: string;
  name: string;
  number: string;
  description: string;
  dateAdded: Date;
  callCount: number;
}

export function useTransferNumbers() {
  const { user } = useAuth();
  const [transferNumbers, setTransferNumbers] = useState<TransferNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch transfer numbers from the database
  const fetchTransferNumbers = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Fetching transfer numbers for user:", user.id);
      const { data, error } = await supabase
        .from('transfer_numbers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        console.log("Fetched transfer numbers:", data);
        const formattedData = data.map(item => ({
          id: item.id,
          name: item.name,
          number: item.phone_number,
          description: item.description || "No description provided",
          dateAdded: new Date(item.created_at),
          callCount: 0 // This would come from a different table in a real implementation
        }));
        
        setTransferNumbers(formattedData);
      }
    } catch (error) {
      console.error("Error fetching transfer numbers:", error);
      toast({
        title: "Error loading transfer numbers",
        description: "Could not load your transfer numbers from the database",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load transfer numbers on component mount
  useEffect(() => {
    if (user) {
      fetchTransferNumbers();
    }
  }, [user]);
  
  // Add a new transfer number
  const addTransferNumber = async (name: string, number: string, description: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add transfer numbers",
        variant: "destructive",
      });
      return null;
    }
    
    if (!name || !number) {
      toast({
        title: "Missing information",
        description: "Please provide both a name and a number",
        variant: "destructive",
      });
      return null;
    }
    
    // Basic validation for phone number format
    const phoneRegex = /^\+?[0-9\s\-()]+$/;
    if (!phoneRegex.test(number)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      console.log("Adding transfer number for user:", user.id);
      // Insert the transfer number into the database
      const { data, error } = await supabase
        .from('transfer_numbers')
        .insert({
          user_id: user.id,
          name: name,
          phone_number: number,
          description: description || null
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log("Added transfer number, response:", data);
      
      if (data && data.length > 0) {
        const newItem = data[0];
        const newTransferNumber: TransferNumber = {
          id: newItem.id,
          name: newItem.name,
          number: newItem.phone_number,
          description: newItem.description || "No description provided",
          dateAdded: new Date(newItem.created_at),
          callCount: 0
        };
        
        setTransferNumbers([newTransferNumber, ...transferNumbers]);
        
        toast({
          title: "Transfer number added",
          description: `${name} (${number}) has been added successfully`,
        });
        
        return newTransferNumber;
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
    }
  };
  
  // Delete a transfer number
  const deleteTransferNumber = async (id: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('transfer_numbers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      setTransferNumbers(transferNumbers.filter(tn => tn.id !== id));
      
      toast({
        title: "Transfer number deleted",
        description: "The transfer number has been removed",
      });
      
      return true;
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
    transferNumbers,
    isLoading,
    addTransferNumber,
    deleteTransferNumber,
    refreshTransferNumbers: fetchTransferNumbers
  };
}
