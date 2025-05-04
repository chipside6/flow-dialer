
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContactList } from "@/components/campaign-wizard/types";
import { toast } from "@/components/ui/use-toast";

export const useFetchDialerResources = () => {
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchContactLists = async () => {
      try {
        const { data, error } = await supabase
          .from("contact_lists")
          .select("id, name");

        if (error) {
          throw new Error(error.message);
        }

        if (isMounted) {
          setContactLists(data ?? []);
        }
      } catch (err: any) {
        console.error("Error fetching contact lists:", err);
        setError(err.message || "Unknown error");

        toast({
          title: "Error loading contact lists",
          description: "Could not load your contact lists. Please try again.",
          variant: "destructive",
        });
      } finally {
        if (isMounted) setIsLoadingLists(false);
      }
    };

    fetchContactLists();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    contactLists,
    isLoadingLists,
    error,
    hasData: contactLists.length > 0,
  };
};
