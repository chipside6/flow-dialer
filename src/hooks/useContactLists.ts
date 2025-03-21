
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";

export interface ContactList {
  id: string;
  name: string;
  description: string;
  contactCount: number;
  dateCreated: Date;
  lastModified: Date;
}

export const useContactLists = () => {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchContactLists = async () => {
      if (!user) {
        setLists([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('contact_lists')
          .select(`
            *,
            contact_list_items:contact_list_items(count)
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        // Transform data to match ContactList interface
        const transformedData = (data || []).map((list: any) => ({
          id: list.id,
          name: list.name,
          description: list.description || "",
          contactCount: list.contact_list_items?.length || 0,
          dateCreated: new Date(list.created_at),
          lastModified: new Date(list.updated_at)
        }));
        
        setLists(transformedData);
      } catch (err: any) {
        console.error("Error fetching contact lists:", err);
        setError(err);
        toast({
          title: "Error loading contact lists",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactLists();
  }, [user]);

  const createContactList = async (data: Omit<ContactList, 'id' | 'contactCount' | 'dateCreated' | 'lastModified'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a contact list",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data: newList, error } = await supabase
        .from('contact_lists')
        .insert({
          name: data.name,
          description: data.description,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const formattedList: ContactList = {
        id: newList.id,
        name: newList.name,
        description: newList.description || "",
        contactCount: 0,
        dateCreated: new Date(newList.created_at),
        lastModified: new Date(newList.updated_at)
      };

      setLists([...lists, formattedList]);
      
      toast({
        title: "Contact list created",
        description: `${data.name} has been created successfully`,
      });

      return formattedList;
    } catch (err: any) {
      console.error("Error creating contact list:", err);
      toast({
        title: "Error creating contact list",
        description: err.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteContactList = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLists(lists.filter(list => list.id !== id));
      toast({
        title: "Contact list deleted",
        description: "The contact list has been removed",
      });
    } catch (err: any) {
      console.error("Error deleting contact list:", err);
      toast({
        title: "Error deleting list",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return {
    lists,
    isLoading,
    error,
    createContactList,
    deleteContactList
  };
};
