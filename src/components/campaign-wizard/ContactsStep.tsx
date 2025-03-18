
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignData, ContactList } from "./types";

interface ContactsStepProps {
  campaign: CampaignData;
  contactLists: ContactList[];
  onSelectChange: (name: string, value: string) => void;
}

export const ContactsStep = ({ campaign, contactLists, onSelectChange }: ContactsStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="contactListId">Select Contact List</Label>
        <Select
          value={campaign.contactListId}
          onValueChange={(value) => onSelectChange("contactListId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a contact list" />
          </SelectTrigger>
          <SelectContent>
            {contactLists.map(list => (
              <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
