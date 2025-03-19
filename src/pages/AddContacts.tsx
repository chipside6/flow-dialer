
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { ArrowLeft, ArrowRight, Plus, Trash } from "lucide-react";

interface Contact {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
}

const AddContacts = () => {
  const [listId, setListId] = useState<string | null>(null);
  const [listName, setListName] = useState<string>("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState<Contact>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get the list ID from sessionStorage
  useEffect(() => {
    const currentListId = sessionStorage.getItem("currentContactListId");
    if (currentListId) {
      setListId(currentListId);
      fetchListDetails(currentListId);
    } else {
      toast({
        title: "No list selected",
        description: "Please select a contact list first",
        variant: "destructive"
      });
      navigate("/contact-lists");
    }
  }, []);
  
  const fetchListDetails = async (id: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('contact_lists')
        .select('name')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setListName(data.name);
      }
    } catch (error: any) {
      console.error('Error fetching list details:', error.message);
      toast({
        title: "Error loading list",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewContact(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const addContact = () => {
    // Basic validation
    if (!newContact.firstName || !newContact.lastName || !newContact.phoneNumber) {
      toast({
        title: "Missing information",
        description: "First name, last name, and phone number are required",
        variant: "destructive"
      });
      return;
    }
    
    // Add to local state
    setContacts([...contacts, { ...newContact }]);
    
    // Reset form
    setNewContact({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: ""
    });
    
    toast({
      title: "Contact added",
      description: "Contact has been added to the list"
    });
  };
  
  const removeContact = (index: number) => {
    const updatedContacts = [...contacts];
    updatedContacts.splice(index, 1);
    setContacts(updatedContacts);
  };
  
  const saveContacts = async () => {
    if (!user || !listId || contacts.length === 0) return;
    
    try {
      // For each contact, first create it in the contacts table
      for (const contact of contacts) {
        // 1. Insert contact
        const { data: contactData, error: contactError } = await supabase
          .from('contacts')
          .insert({
            first_name: contact.firstName,
            last_name: contact.lastName,
            phone_number: contact.phoneNumber,
            email: contact.email || null,
            user_id: user.id
          })
          .select()
          .single();
        
        if (contactError) throw contactError;
        
        if (!contactData) continue;
        
        // 2. Link contact to the list
        const { error: linkError } = await supabase
          .from('contact_list_items')
          .insert({
            contact_id: contactData.id,
            contact_list_id: listId
          });
        
        if (linkError) throw linkError;
      }
      
      toast({
        title: "Contacts saved",
        description: `${contacts.length} contacts have been added to "${listName}"`
      });
      
      // Navigate back to contact lists
      navigate("/contact-lists");
    } catch (error: any) {
      console.error('Error saving contacts:', error.message);
      toast({
        title: "Failed to save contacts",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container max-w-4xl mx-auto py-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Add Contacts</h1>
            {listName && (
              <p className="text-muted-foreground">to {listName}</p>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/contact-lists")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lists
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Contact</CardTitle>
            <CardDescription>
              Enter contact information below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={newContact.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={newContact.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={newContact.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newContact.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={addContact} className="ml-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </CardFooter>
        </Card>
        
        {contacts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Contacts to Add</CardTitle>
              <CardDescription>
                You have {contacts.length} contacts ready to add
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Phone</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {contacts.map((contact, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="px-4 py-2">
                          {contact.firstName} {contact.lastName}
                        </td>
                        <td className="px-4 py-2">{contact.phoneNumber}</td>
                        <td className="px-4 py-2">{contact.email || "-"}</td>
                        <td className="px-4 py-2 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeContact(index)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={saveContacts}>
                Save Contacts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AddContacts;
