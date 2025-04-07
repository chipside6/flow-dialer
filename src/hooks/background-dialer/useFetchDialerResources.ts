
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContactList } from "@/components/campaign-wizard/types";
import { toast } from "@/components/ui/use-toast";

export const useFetchDialerResources = () => {
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(true);
  
  useEffect(() => {
    const fetchContactLists = async () => {
      try {
        const { data, error } = await supabase
          .from('contact_lists')
          .select('id, name');
        
        if (error) {
          throw new Error(error.message);
        }
        
        setContactLists(data || []);
      } catch (err) {
        console.error("Error fetching contact lists:", err);
        toast({
          title: "Error loading contact lists",
          description: "Could not load your contact lists. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingLists(false);
      }
    };
    
    fetchContactLists();
  }, []);
  
  return { contactLists, isLoadingLists };
};
