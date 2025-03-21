
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play } from "lucide-react";
import { SipProvider, ContactList, DialerFormData } from "./types";

interface DialerFormProps {
  sipProviders: SipProvider[];
  contactLists: ContactList[];
  formData: DialerFormData;
  isLoadingProviders: boolean;
  isLoadingLists: boolean;
  onChange: (field: keyof DialerFormData, value: string) => void;
  onStart: () => void;
}

const DialerForm: React.FC<DialerFormProps> = ({
  sipProviders,
  contactLists,
  formData,
  isLoadingProviders,
  isLoadingLists,
  onChange,
  onStart
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sip-provider">SIP Provider</Label>
          <Select
            value={formData.sipProviderId}
            onValueChange={(value) => onChange("sipProviderId", value)}
          >
            <SelectTrigger id="sip-provider" disabled={isLoadingProviders}>
              <SelectValue placeholder={isLoadingProviders ? "Loading..." : "Select a SIP provider"} />
            </SelectTrigger>
            <SelectContent>
              {sipProviders.length === 0 ? (
                <SelectItem value="none" disabled>No SIP providers available</SelectItem>
              ) : (
                sipProviders.map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="contact-list">Contact List</Label>
          <Select
            value={formData.contactListId}
            onValueChange={(value) => onChange("contactListId", value)}
          >
            <SelectTrigger id="contact-list" disabled={isLoadingLists}>
              <SelectValue placeholder={isLoadingLists ? "Loading..." : "Select a contact list"} />
            </SelectTrigger>
            <SelectContent>
              {contactLists.length === 0 ? (
                <SelectItem value="none" disabled>No contact lists available</SelectItem>
              ) : (
                contactLists.map(list => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name} ({list.contactCount} contacts)
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="transfer-number">Transfer Number (Optional)</Label>
        <Input
          id="transfer-number"
          placeholder="Enter transfer destination"
          value={formData.transferNumber}
          onChange={(e) => onChange("transferNumber", e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="greeting-file">Greeting Audio File</Label>
        <Input
          id="greeting-file"
          placeholder="greeting.wav"
          value={formData.greetingFile}
          onChange={(e) => onChange("greetingFile", e.target.value)}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          onClick={onStart} 
          className="bg-green-600 hover:bg-green-700"
          disabled={isLoadingProviders || isLoadingLists || sipProviders.length === 0 || contactLists.length === 0}
        >
          <Play className="mr-2 h-4 w-4" />
          Start Dialing
        </Button>
      </div>
    </div>
  );
};

export default DialerForm;
