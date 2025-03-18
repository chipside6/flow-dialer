import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { ContactIcon, Trash, UserPlus, UploadCloud, Download, Contact, Users, Calendar, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  const [bulkNumbers, setBulkNumbers] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);
  
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
  
  const handleBulkAdd = (listId: string) => {
    if (!bulkNumbers.trim()) {
      toast({
        title: "No numbers provided",
        description: "Please enter phone numbers to add to the list",
        variant: "destructive",
      });
      return;
    }
    
    // Split by newlines, commas, or semicolons
    const numbers = bulkNumbers
      .split(/[\n,;]+/)
      .map(num => num.trim())
      .filter(num => num.length > 0);
    
    // Basic validation
    const phoneRegex = /^\+?[0-9\s\-()]+$/;
    const validNumbers = numbers.filter(num => phoneRegex.test(num));
    
    // Update the contact count for the list
    setLists(lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          contactCount: list.contactCount + validNumbers.length,
          lastModified: new Date()
        };
      }
      return list;
    }));
    
    setBulkNumbers("");
    setShowBulkInput(false);
    
    toast({
      title: "Contacts added",
      description: `Added ${validNumbers.length} contacts to the list`,
    });
  };
  
  const handleDeleteList = (id: string) => {
    setLists(lists.filter(list => list.id !== id));
    toast({
      title: "List deleted",
      description: "The contact list has been removed",
    });
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, listId: string) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const file = selectedFiles[0];
    
    // In a real application, we would parse the file and extract contacts
    // For this demo, we'll simulate adding a random number of contacts
    const contactsAdded = Math.floor(Math.random() * 100) + 10;
    
    setLists(lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          contactCount: list.contactCount + contactsAdded,
          lastModified: new Date()
        };
      }
      return list;
    }));
    
    toast({
      title: "File processed",
      description: `Added ${contactsAdded} contacts from ${file.name}`,
    });
  };
  
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
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Contact Lists</h1>
              </div>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create New Contact List
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="list-name">List Name</Label>
                      <Input
                        id="list-name"
                        placeholder="Enter a name for your contact list"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="list-description">Description</Label>
                      <Textarea
                        id="list-description"
                        placeholder="Describe the purpose of this list"
                        value={newListDescription}
                        onChange={(e) => setNewListDescription(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateList}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create List
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ContactIcon className="mr-2 h-5 w-5" />
                    Your Contact Lists
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lists.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      No contact lists yet. Create your first list above.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {lists.map((list) => (
                        <Card key={list.id} className="border border-border/40">
                          <CardHeader className="bg-muted/30 pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-xl flex items-center">
                                  <Contact className="mr-2 h-5 w-5" />
                                  {list.name}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {list.description}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteList(list.id)}>
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Contacts</p>
                                <p className="text-lg font-medium flex items-center">
                                  <Users className="mr-2 h-4 w-4 text-primary" />
                                  {list.contactCount}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Created</p>
                                <p className="text-sm font-medium flex items-center">
                                  <Calendar className="mr-2 h-4 w-4 text-primary" />
                                  {formatDistanceToNow(list.dateCreated, { addSuffix: true })}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Last Modified</p>
                                <p className="text-sm font-medium flex items-center">
                                  <Calendar className="mr-2 h-4 w-4 text-primary" />
                                  {formatDistanceToNow(list.lastModified, { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <input
                                type="file"
                                accept=".csv,.txt"
                                id={`file-upload-${list.id}`}
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, list.id)}
                              />
                              <Button variant="outline" size="sm" onClick={() => document.getElementById(`file-upload-${list.id}`)?.click()}>
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Import CSV
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setShowBulkInput(!showBulkInput)}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Contacts
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                              </Button>
                              <Button variant="outline" size="sm">
                                <FileText className="mr-2 h-4 w-4" />
                                View Contacts
                              </Button>
                            </div>
                            
                            {showBulkInput && (
                              <div className="mt-4 space-y-2">
                                <Textarea
                                  placeholder="Enter multiple phone numbers (separated by newlines, commas, or semicolons)"
                                  value={bulkNumbers}
                                  onChange={(e) => setBulkNumbers(e.target.value)}
                                  className="min-h-[100px]"
                                />
                                <Button size="sm" onClick={() => handleBulkAdd(list.id)}>
                                  Add Contacts
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactLists;
