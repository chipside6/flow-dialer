
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Calendar, Trash, UserPlus } from "lucide-react";

interface ContactList {
  id: string;
  name: string;
  description: string;
  contactCount: number;
  dateCreated: Date;
  lastModified: Date;
}

interface ContactListsDisplayProps {
  lists: ContactList[];
}

const ContactListsDisplay = ({ lists }: ContactListsDisplayProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleDeleteList = async (listId: string, listName: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete a contact list",
        variant: "destructive"
      });
      return;
    }
    
    if (!confirm(`Are you sure you want to delete the list "${listName}"?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('contact_lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Show success message and refresh page to update list
      toast({
        title: "Contact list deleted",
        description: `List "${listName}" has been deleted successfully`
      });
      
      window.location.reload();
    } catch (error: any) {
      console.error('Error deleting contact list:', error.message);
      toast({
        title: "Failed to delete contact list",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleAddContacts = (listId: string) => {
    // Store the list ID in sessionStorage
    sessionStorage.setItem("currentContactListId", listId);
    navigate(`/contacts/add`);
  };
  
  if (lists.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Your Contact Lists</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lists.map((list) => (
            <Card key={list.id} className="border border-border/40">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{list.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {list.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Contacts:</span> {list.contactCount}
                      </p>
                      <p className="text-sm flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" /> 
                        <span className="text-muted-foreground">Created:</span> {list.dateCreated.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddContacts(list.id)}
                      className="flex items-center"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add Contacts
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteList(list.id, list.name)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactListsDisplay;
