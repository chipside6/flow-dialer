
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignData } from "./types";
import { ContactList } from "@/hooks/useContactLists";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
              value={campaign.contactListId || ""}
              onValueChange={(value) => onSelectChange("contactListId", value)}
            >
              <SelectTrigger id="contactListId" className="w-full bg-white dark:bg-gray-800">
                <SelectValue placeholder="Select a contact list" />
              </SelectTrigger>
              <SelectContent position="popper" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md">
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
          <div className="mt-4">
            <Alert variant="warning" className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-sm text-amber-700 dark:text-amber-300">
                You don't have any contact lists yet. Please create one in the Contact Lists section.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};
