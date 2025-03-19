
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateContactListForm from "@/components/contact-lists/CreateContactListForm";
import EmptyContactListsState from "@/components/contact-lists/EmptyContactListsState";
import ContactListsDisplay from "@/components/contact-lists/ContactListsDisplay";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface ContactList {
  id: string;
  name: string;
  description: string;
  contactCount: number;
  dateCreated: Date;
  lastModified: Date;
}

const ContactLists = () => {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [returnToCampaign, setReturnToCampaign] = useState(false);
  
  // Check if we have campaign data stored (came from campaign wizard)
  useEffect(() => {
    const campaignData = sessionStorage.getItem("currentCampaignData");
    if (campaignData) {
      setReturnToCampaign(true);
    }
  }, []);

  // Fetch contact lists from Supabase
  useEffect(() => {
    const fetchContactLists = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get all contact lists for the current user
        const { data, error } = await supabase
          .from('contact_lists')
          .select('*, contacts:contact_list_items(count)')
          .eq('user_id', user.id);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Transform Supabase data to our expected format
          const transformedLists = data.map(list => ({
            id: list.id,
            name: list.name,
            description: list.description || '',
            contactCount: Array.isArray(list.contacts) ? list.contacts.length : 0,
            dateCreated: new Date(list.created_at),
            lastModified: new Date(list.updated_at)
          }));
          
          setLists(transformedLists);
        }
      } catch (error: any) {
        console.error('Error fetching contact lists:', error.message);
        toast({
          title: "Failed to load contact lists",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactLists();
  }, [user, toast]);
  
  const handleListCreated = async (newList: ContactList) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to create a contact list",
          variant: "destructive"
        });
        return;
      }
      
      // Insert the new list to Supabase
      const { data, error } = await supabase
        .from('contact_lists')
        .insert({
          name: newList.name,
          description: newList.description,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Add the new list to state with the correct ID from Supabase
        const createdList = {
          ...newList,
          id: data.id,
          dateCreated: new Date(data.created_at),
          lastModified: new Date(data.updated_at)
        };
        setLists(prev => [...prev, createdList]);
        
        toast({
          title: "Contact list created",
          description: `List "${newList.name}" has been created successfully`
        });
      }
    } catch (error: any) {
      console.error('Error creating contact list:', error.message);
      toast({
        title: "Failed to create contact list",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleReturnToCampaign = () => {
    navigate('/campaigns/new');
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container-fluid overflow-x-hidden w-full h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container-fluid overflow-x-hidden w-full">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Contact Lists</h1>
          
          {returnToCampaign && (
            <Button 
              variant="outline" 
              onClick={handleReturnToCampaign}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaign
            </Button>
          )}
        </div>
        
        <CreateContactListForm onListCreated={handleListCreated} />
        
        {lists.length === 0 ? (
          <EmptyContactListsState />
        ) : (
          <ContactListsDisplay lists={lists} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ContactLists;
