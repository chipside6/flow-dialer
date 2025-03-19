
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CampaignData, ContactList } from "./types";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface ContactsStepProps {
  campaign: CampaignData;
  contactLists: ContactList[];
  onSelectChange: (name: string, value: string) => void;
}

export const ContactsStep = ({ campaign, contactLists, onSelectChange }: ContactsStepProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddContactsClick = () => {
    // Store current campaign data in sessionStorage to preserve it during navigation
    try {
      sessionStorage.setItem("currentCampaignData", JSON.stringify(campaign));
      navigate("/contact-lists");
    } catch (error) {
      console.error("Error saving campaign data:", error);
      toast({
        title: "Navigation error",
        description: "There was a problem saving your campaign data",
        variant: "destructive",
      });
    }
  };

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
            {contactLists.length === 0 ? (
              <SelectItem value="empty" disabled>No contact lists available</SelectItem>
            ) : (
              contactLists.map(list => (
                <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between pt-2">
        <Button 
          variant="outline" 
          type="button" 
          onClick={handleAddContactsClick}
        >
          Add Contacts
        </Button>
      </div>
    </div>
  );
};
