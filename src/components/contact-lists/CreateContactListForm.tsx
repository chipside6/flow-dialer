
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { UserPlus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CreateContactListFormProps {
  onListCreated: (list: {
    id: string;
    name: string;
    description: string;
    contactCount: number;
    dateCreated: Date;
    lastModified: Date;
  }) => void;
}

const CreateContactListForm = ({ onListCreated }: CreateContactListFormProps) => {
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const isMobile = useIsMobile();
  
  const handleCreateList = () => {
    if (!newListName) {
      toast({
        title: "Missing information",
        description: "Please provide a name for your contact list",
        variant: "destructive",
      });
      return;
    }
    
    const newList = {
      id: Date.now().toString(),
      name: newListName,
      description: newListDescription || "No description provided",
      contactCount: 0,
      dateCreated: new Date(),
      lastModified: new Date()
    };
    
    onListCreated(newList);
    setNewListName("");
    setNewListDescription("");
    
    toast({
      title: "List created",
      description: `${newListName} has been created successfully`,
    });
  };

  return (
    <Card className="mb-8 w-full">
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
              placeholder={isMobile ? "List name" : "Enter a name for your contact list"}
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="list-description" className="text-sm font-medium leading-none mb-2 block">Description</label>
            <Textarea
              id="list-description"
              placeholder={isMobile ? "List purpose" : "Describe the purpose of this list"}
              value={newListDescription}
              onChange={(e) => setNewListDescription(e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={handleCreateList} className="bg-purple-500 hover:bg-purple-600 w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            Create List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateContactListForm;
