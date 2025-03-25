
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { logSupabaseOperation, OperationType } from "@/utils/supabaseDebug";
import { ContactList, ContactListsState } from "./types";

export const useContactListsState = (): ContactListsState & { 
  fetchContactLists: () => Promise<void>;
  setLists: React.Dispatch<React.SetStateAction<ContactList[]>>;
} => {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchContactLists = async () => {
    // If there's a previous request in progress, abort it
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear any pending timeouts
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
    
    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    if (!user) {
      setLists([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching contact lists for user:", user.id);
      
      // Set a timeout to prevent the loading state from getting stuck
      fetchTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          console.log("Fetch timeout reached, ending loading state");
          setIsLoading(false);
          toast({
            title: "Loading timed out",
            description: "Fetching contact lists is taking longer than expected. Please try refreshing.",
            variant: "destructive"
          });
        }
      }, 8000);
      
      const { data, error } = await supabase
        .from('contact_lists')
        .select(`
          *,
          contact_list_items:contact_list_items(count)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error("Supabase error:", error);
        logSupabaseOperation({
          operation: OperationType.READ,
          table: 'contact_lists',
          user_id: user.id,
          success: false,
          error,
          auth_status: 'AUTHENTICATED'
        });
        throw error;
      }

      console.log("Contact lists data from DB:", data);
      logSupabaseOperation({
        operation: OperationType.READ,
        table: 'contact_lists',
        user_id: user.id,
        success: true,
        data,
        auth_status: 'AUTHENTICATED'
      });
      
      // Transform data to match ContactList interface
      const transformedData = (data || []).map((list: any) => ({
        id: list.id,
        name: list.name,
        description: list.description || "",
        contactCount: list.contact_list_items?.length || 0,
        dateCreated: new Date(list.created_at),
        lastModified: new Date(list.updated_at)
      }));
      
      console.log("Transformed contact lists:", transformedData);
      setLists(transformedData);
    } catch (err: any) {
      // Only set error if this request wasn't aborted
      if (err.name !== 'AbortError') {
        console.error("Error fetching contact lists:", err);
        setError(err);
        toast({
          title: "Error loading contact lists",
          description: err.message,
          variant: "destructive"
        });
      }
    } finally {
      // Clear the timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
      // Set loading to false regardless
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContactLists();
    
    // Safety timeout to ensure isLoading state doesn't get stuck
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Safety timeout reached, resetting loading state");
        setIsLoading(false);
      }
    }, 10000);

    return () => {
      // Clean up abort controller
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Clean up timeouts
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      clearTimeout(safetyTimeout);
    };
  }, [user]);

  return {
    lists,
    isLoading,
    error,
    fetchContactLists,
    setLists
  };
};
