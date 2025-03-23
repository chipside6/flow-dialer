
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignData } from "./types";
import { ContactList } from "@/hooks/useContactLists";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";

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
        <Label htmlFor="contactListId">Select Contact List</Label>
        {isLoading ? (
          <Skeleton className="h-10 w-full mt-1" />
        ) : (
          <Select
            value={campaign.contactListId}
            onValueChange={(value) => onSelectChange("contactListId", value)}
          >
            <SelectTrigger id="contactListId" className="w-full mt-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
              <SelectValue placeholder="Select a contact list" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
              {contactLists.length === 0 ? (
                <SelectItem value="empty" disabled>No contact lists available</SelectItem>
              ) : (
                contactLists.map(list => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name} ({list.contactCount} contacts)
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};
