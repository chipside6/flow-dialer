
import { useState, useEffect, useCallback } from "react";
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
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);
  
  // Force reset loading state after 10 seconds to prevent UI from getting stuck
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (isLoading) {
      timeoutId = window.setTimeout(() => {
        console.log("Loading timeout reached, resetting isLoading state");
        setIsLoading(false);
      }, 10000);
    }
    
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      // Reset states when unmounting
      setIsLoading(false);
      setIsSubmitting(false);
    };
  }, [isLoading]);
  
  // Reset isSubmitting after 5 seconds to prevent it from getting stuck
  useEffect(() => {
    let submitTimeout: number | undefined;
    
    if (isSubmitting) {
      submitTimeout = window.setTimeout(() => {
        console.log("Submit timeout reached, resetting isSubmitting state");
        setIsSubmitting(false);
      }, 5000);
    }
    
    return () => {
      if (submitTimeout) {
        window.clearTimeout(submitTimeout);
      }
    };
  }, [isSubmitting]);
  
  // Load transfer numbers when user or lastRefresh changes
  useEffect(() => {
    if (user) {
      console.log("User or refresh trigger changed, fetching transfer numbers");
      fetchTransferNumbers();
    } else {
      setTransferNumbers([]);
      setIsLoading(false);
      setError(null);
    }
  }, [user, lastRefresh]);
  
  // Fetch transfer numbers from the database - using useCallback to prevent recreation
  const fetchTransferNumbers = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("Setting isLoading to true");
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching transfer numbers for user:", user.id);
      const formattedData = await fetchUserTransferNumbers(user.id);
      
      console.log("Successfully fetched transfer numbers:", formattedData.length);
      setTransferNumbers(formattedData);
    } catch (error) {
      console.error("Error fetching transfer numbers:", error);
      setError("Failed to load transfer numbers");
      toast({
        title: "Error loading transfer numbers",
        description: "Could not load your transfer numbers from the database",
        variant: "destructive"
      });
      // Reset state on error to prevent stuck states
      setTransferNumbers([]);
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
    }
  }, [user]);
  
  // Add a new transfer number
  const addTransferNumber = async (name: string, number: string, description: string) => {
    console.log("addTransferNumber called with:", { name, number, description });
    
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
    if (isSubmitting) {
      console.log("Already submitting, ignoring additional request");
      return null;
    }
    
    try {
      console.log("Setting isSubmitting to true");
      setIsSubmitting(true);
      
      console.log("Adding transfer number for user:", user.id, {name, number});
      const newTransferNumber = await addTransferNumberToDatabase(user.id, name, number, description);
      
      if (newTransferNumber) {
        console.log("Successfully added transfer number:", newTransferNumber);
        
        toast({
          title: "Transfer number added",
          description: `${name} (${number}) has been added successfully`,
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
  
  // Function to trigger a refresh without additional API calls
  const refreshTransferNumbers = () => {
    console.log("Refreshing transfer numbers");
    setLastRefresh(Date.now());
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
    error,
    addTransferNumber,
    deleteTransferNumber,
    refreshTransferNumbers
  };
}
