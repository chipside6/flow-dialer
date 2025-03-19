
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  );
};

export default ContactListsDisplay;
