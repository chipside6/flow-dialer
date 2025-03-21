
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
        console.log("Fetching contact lists for user:", user.id);
        
        const { data, error } = await supabase
          .from('contact_lists')
          .select(`
            *,
            contact_list_items:contact_list_items(count)
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Contact lists data from DB:", data);
        
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
      console.log("Creating contact list:", data, "for user:", user.id);
      
      const { data: newList, error } = await supabase
        .from('contact_lists')
        .insert({
          name: data.name,
          description: data.description,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("New contact list created:", newList);
      
      const formattedList: ContactList = {
        id: newList.id,
        name: newList.name,
        description: newList.description || "",
        contactCount: 0,
        dateCreated: new Date(newList.created_at),
        lastModified: new Date(newList.updated_at)
      };

      setLists(prevLists => [...prevLists, formattedList]);
      
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
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete a contact list",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      console.log("Deleting contact list:", id);
      
      const { error } = await supabase
        .from('contact_lists')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      setLists(lists.filter(list => list.id !== id));
      
      toast({
        title: "Contact list deleted",
        description: "The contact list has been removed",
      });
      
      return true;
    } catch (err: any) {
      console.error("Error deleting contact list:", err);
      toast({
        title: "Error deleting list",
        description: err.message,
        variant: "destructive"
      });
      return false;
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
