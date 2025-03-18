
import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { UserPlus } from "lucide-react";

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
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  
  const handleCreateList = () => {
    if (!newListName) {
      toast({
        title: "Missing information",
        description: "Please provide a name for your contact list",
        variant: "destructive",
      });
      return;
    }
    
    const newList: ContactList = {
      id: Date.now().toString(),
      name: newListName,
      description: newListDescription || "No description provided",
      contactCount: 0,
      dateCreated: new Date(),
      lastModified: new Date()
    };
    
    setLists([...lists, newList]);
    setNewListName("");
    setNewListDescription("");
    
    toast({
      title: "List created",
      description: `${newListName} has been created successfully`,
    });
  };
  
  // Empty state component
  const EmptyListsState = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl text-center">No Contact Lists Yet</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-4">
          Create your first contact list to start adding phone numbers
        </p>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <DashboardNav />
            </div>
            <div className="md:w-3/4">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Contact Lists</h1>
              </div>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create New Contact List
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="list-name" className="text-sm font-medium leading-none mb-2 block">List Name</label>
                      <Input
                        id="list-name"
                        placeholder="Enter a name for your contact list"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="list-description" className="text-sm font-medium leading-none mb-2 block">Description</label>
                      <Textarea
                        id="list-description"
                        placeholder="Describe the purpose of this list"
                        value={newListDescription}
                        onChange={(e) => setNewListDescription(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateList} className="bg-purple-500 hover:bg-purple-600">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create List
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {lists.length === 0 ? (
                <EmptyListsState />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Your Contact Lists</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Contact list UI would render here when lists exist */}
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
                                <p className="text-sm mt-2">
                                  <span className="text-muted-foreground">Contacts:</span> {list.contactCount}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  Add Contacts
                                </Button>
                                <Button variant="outline" size="sm" className="text-destructive">
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactLists;
