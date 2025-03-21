
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { fetchUserTransferNumbers } from "@/services/transferNumberService";
import { 
  addTransferNumberToDatabase, 
  deleteTransferNumberFromDatabase 
} from "@/services/transferNumberService";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load transfer numbers on component mount
  useEffect(() => {
    if (user) {
      fetchTransferNumbers();
    } else {
      setIsLoading(false);
    }
  }, [user]);
  
  // Fetch transfer numbers from the database
  const fetchTransferNumbers = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Fetching transfer numbers for user:", user.id);
      const formattedData = await fetchUserTransferNumbers(user.id);
      console.log("Successfully fetched transfer numbers:", formattedData.length);
      setTransferNumbers(formattedData);
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
    
    if (!validateTransferNumberInput(name, number)) {
      return null;
    }
    
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log("Already submitting, ignoring additional request");
      return null;
    }
    
    try {
      console.log("Setting isSubmitting to true");
      setIsSubmitting(true);
      console.log("Adding transfer number for user:", user.id);
      const newTransferNumber = await addTransferNumberToDatabase(user.id, name, number, description);
      
      if (newTransferNumber) {
        console.log("Successfully added transfer number:", newTransferNumber);
        // Update state with the new transfer number
        setTransferNumbers(prevNumbers => [newTransferNumber, ...prevNumbers]);
        
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
    } finally {
      // Ensure isSubmitting is always reset
      console.log("Setting isSubmitting to false");
      setIsSubmitting(false);
    }
  };
  
  // Delete a transfer number
  const deleteTransferNumber = async (id: string) => {
    if (!user) return false;
    
    try {
      console.log("Deleting transfer number:", id);
      const success = await deleteTransferNumberFromDatabase(user.id, id);
      
      if (success) {
        console.log("Successfully deleted transfer number:", id);
        setTransferNumbers(prevNumbers => prevNumbers.filter(tn => tn.id !== id));
        
        toast({
          title: "Transfer number deleted",
          description: "The transfer number has been removed",
        });
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
  
  // Validate input for transfer number
  const validateTransferNumberInput = (name: string, number: string) => {
    if (!name || !number) {
      toast({
        title: "Missing information",
        description: "Please provide both a name and a number",
        variant: "destructive",
      });
      return false;
    }
    
    // Basic validation for phone number format
    const phoneRegex = /^\+?[0-9\s\-()]+$/;
    if (!phoneRegex.test(number)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  return {
    transferNumbers,
    isLoading,
    isSubmitting,
    addTransferNumber,
    deleteTransferNumber,
    refreshTransferNumbers: fetchTransferNumbers
  };
}
