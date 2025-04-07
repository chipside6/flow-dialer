
import { useState, useEffect } from "react";
import { ContactList } from "@/components/background-dialer/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { 
  createDialerError, 
  DialerErrorType, 
  handleDialerError 
} from "@/utils/errorHandlingUtils";

export const useFetchDialerResources = () => {
  const { user } = useAuth();
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(true);
  
  // Fetch contact lists
  useEffect(() => {
    const fetchContactLists = async () => {
      if (!user) {
        setContactLists([]);
        setIsLoadingLists(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('contact_lists')
          .select(`
            id, 
            name,
            contact_list_items:contact_list_items(count)
          `)
          .eq('user_id', user.id);

        if (error) throw error;
        
        const transformedData = (data || []).map(list => ({
          id: list.id,
          name: list.name,
          contactCount: list.contact_list_items?.length || 0
        }));
        
        setContactLists(transformedData);
      } catch (err) {
        console.error("Error fetching contact lists:", err);
        handleDialerError(createDialerError(
          DialerErrorType.CONTACT_LIST,
          "Could not load your contact lists",
          err
        ));
      } finally {
        setIsLoadingLists(false);
      }
    };

    fetchContactLists();
  }, [user]);
  
  return {
    contactLists,
    isLoadingLists
  };
};
