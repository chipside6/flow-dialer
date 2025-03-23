
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { logSupabaseOperation, OperationType } from "@/utils/supabaseDebug";
import { ContactList, UseContactListsOperationsReturn } from "./types";

export const useContactListOperations = (
  lists: ContactList[],
  setLists: React.Dispatch<React.SetStateAction<ContactList[]>>,
  fetchContactLists: () => Promise<void>
): UseContactListsOperationsReturn => {
  const { user } = useAuth();

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
        logSupabaseOperation({
          operation: OperationType.WRITE,
          table: 'contact_lists',
          user_id: user.id,
          success: false,
          error,
          auth_status: 'AUTHENTICATED'
        });
        throw error;
      }

      console.log("New contact list created:", newList);
      logSupabaseOperation({
        operation: OperationType.WRITE,
        table: 'contact_lists',
        user_id: user.id,
        success: true,
        data: newList,
        auth_status: 'AUTHENTICATED'
      });
      
      const formattedList: ContactList = {
        id: newList.id,
        name: newList.name,
        description: newList.description || "",
        contactCount: 0,
        dateCreated: new Date(newList.created_at),
        lastModified: new Date(newList.updated_at)
      };

      setLists(prevLists => [...prevLists, formattedList]);
      
      return formattedList;
    } catch (err: any) {
      console.error("Error creating contact list:", err);
      throw err;
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
        logSupabaseOperation({
          operation: OperationType.DELETE,
          table: 'contact_lists',
          user_id: user.id,
          success: false,
          error,
          auth_status: 'AUTHENTICATED'
        });
        throw error;
      }

      logSupabaseOperation({
        operation: OperationType.DELETE,
        table: 'contact_lists',
        user_id: user.id,
        success: true,
        data: { id },
        auth_status: 'AUTHENTICATED'
      });
      
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

  const refreshLists = () => {
    fetchContactLists();
  };

  return {
    createContactList,
    deleteContactList,
    refreshLists
  };
};
