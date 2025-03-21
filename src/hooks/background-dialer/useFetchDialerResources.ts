
import { useState, useEffect } from "react";
import { SipProvider, ContactList } from "@/components/background-dialer/types";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

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
        toast({
          title: "Error loading SIP providers",
          description: "Could not load your SIP providers",
          variant: "destructive"
        });
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
        toast({
          title: "Error loading contact lists",
          description: "Could not load your contact lists",
          variant: "destructive"
        });
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
