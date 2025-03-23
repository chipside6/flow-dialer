
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignData } from "./types";
import { ContactList } from "@/hooks/useContactLists";
import { Skeleton } from "@/components/ui/skeleton";

interface ContactsStepProps {
  campaign: CampaignData;
  contactLists: ContactList[];
  onSelectChange: (name: string, value: string) => void;
  isLoading?: boolean;
}

export const ContactsStep = ({ campaign, contactLists, onSelectChange, isLoading = false }: ContactsStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="contactListId" className="block mb-2">Select Contact List</Label>
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <div className="relative">
            <Select
              value={campaign.contactListId}
              onValueChange={(value) => onSelectChange("contactListId", value)}
            >
              <SelectTrigger id="contactListId" className="w-full bg-white dark:bg-gray-800">
                <SelectValue placeholder="Select a contact list" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md z-50">
                {contactLists.length === 0 ? (
                  <SelectItem value="empty" disabled>No contact lists available</SelectItem>
                ) : (
                  contactLists.map(list => (
                    <SelectItem key={list.id} value={list.id} className="py-2">
                      {list.name} ({list.contactCount} contacts)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}
        {contactLists.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground mt-2">
            You don't have any contact lists yet. Please create one in the Contact Lists section.
          </p>
        )}
      </div>
    </div>
  );
};
