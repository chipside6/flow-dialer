
import { useState, useEffect } from "react";
import { SipProvider, ContactList } from "@/components/background-dialer/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { 
  createDialerError, 
  DialerErrorType, 
  handleDialerError 
} from "@/utils/errorHandlingUtils";

export const useFetchDialerResources = () => {
  const { user } = useAuth();
  const [sipProviders, setSipProviders] = useState<SipProvider[]>([]);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [isLoadingLists, setIsLoadingLists] = useState(true);
  
  // Fetch SIP providers and contact lists
  useEffect(() => {
    const fetchProviders = async () => {
      if (!user) {
        setSipProviders([]);
        setIsLoadingProviders(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('sip_providers')
          .select('id, name')
          .eq('user_id', user.id)
          .eq('active', true);

        if (error) throw error;
        
        setSipProviders(data || []);
      } catch (err) {
        console.error("Error fetching SIP providers:", err);
        handleDialerError(createDialerError(
          DialerErrorType.PROVIDER,
          "Could not load your SIP providers",
          err
        ));
      } finally {
        setIsLoadingProviders(false);
      }
    };

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

    fetchProviders();
    fetchContactLists();
  }, [user]);
  
  return {
    sipProviders,
    contactLists,
    isLoadingProviders,
    isLoadingLists
  };
};
