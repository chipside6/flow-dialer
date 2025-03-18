
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  if (lists.length === 0) {
    return null;
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Your Contact Lists</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lists.map((list) => (
            <Card key={list.id} className="border border-border/40">
              <CardContent className="p-4">
                <div className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-start gap-4`}>
                  <div className="flex-1">
                    <h3 className="font-medium">{list.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {list.description}
                    </p>
                    <p className="text-sm mt-2">
                      <span className="text-muted-foreground">Contacts:</span> {list.contactCount}
                    </p>
                  </div>
                  <div className={`flex ${isMobile ? 'w-full mt-3' : ''} gap-2`}>
                    <Button variant="outline" size="sm" className={isMobile ? "flex-1" : ""}>
                      Add Contacts
                    </Button>
                    <Button variant="outline" size="sm" className={`text-destructive ${isMobile ? "flex-1" : ""}`}>
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
