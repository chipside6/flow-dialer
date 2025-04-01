
import { useState, useEffect } from 'react';
import { ContactList } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';
import { logSupabaseOperation, OperationType } from '@/utils/supabaseDebug';

export const useContactListsState = () => {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchContactLists = async () => {
    if (!user) {
      console.log("No user found, skipping contact lists fetch");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log(`Fetching contact lists for user: ${user.id}`);

    try {
      // Set a timeout to handle persistently stuck loading states
      const timeoutId = setTimeout(() => {
        console.log("Fetch timeout reached, ending loading state");
        setIsLoading(false);
      }, 6000);

      const { data, error } = await supabase
        .from('contact_lists')
        .select(`
          *,
          contact_list_items:contact_list_items(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      if (error) {
        console.error("Error fetching contact lists:", error);
        logSupabaseOperation({
          operation: OperationType.READ,
          table: 'contact_lists',
          user_id: user.id,
          success: false,
          error,
          auth_status: 'AUTHENTICATED'
        });
        throw new Error(error.message || "Failed to fetch contact lists");
      }

      logSupabaseOperation({
        operation: OperationType.READ,
        table: 'contact_lists',
        user_id: user.id,
        success: true,
        auth_status: 'AUTHENTICATED'
      });

      const formattedLists: ContactList[] = data.map(list => ({
        id: list.id,
        name: list.name,
        description: list.description || "",
        contactCount: list.contact_list_items?.length || 0,
        dateCreated: new Date(list.created_at),
        lastModified: new Date(list.updated_at)
      }));

      setLists(formattedLists);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error in fetchContactLists:", err);
      setError(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContactLists();
    } else {
      setIsLoading(false);
    }

    // Set a safety timeout to avoid stuck loading states
    const safetyTimeout = setTimeout(() => {
      console.log("Safety timeout reached, resetting loading state");
      setIsLoading(false);
    }, 10000);

    return () => {
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
