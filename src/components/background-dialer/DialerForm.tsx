
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SipProvider, ContactList, DialerFormData } from "./types";
import { Phone, Loader2 } from "lucide-react";

interface DialerFormProps {
  sipProviders: SipProvider[];
  contactLists: ContactList[];
  formData: DialerFormData;
  isLoadingProviders: boolean;
  isLoadingLists: boolean;
  onChange: (field: keyof DialerFormData, value: string) => void;
  onStart: () => void;
  disableSipProviderSelect?: boolean;
}

const DialerForm: React.FC<DialerFormProps> = ({
  sipProviders,
  contactLists,
  formData,
  isLoadingProviders,
  isLoadingLists,
  onChange,
  onStart,
  disableSipProviderSelect = false
}) => {
  const isFormValid = 
    formData.sipProviderId && 
    formData.contactListId && 
    formData.transferNumber;
  
  // Get name of selected SIP provider for display when disabled
  const selectedProviderName = sipProviders.find(p => p.id === formData.sipProviderId)?.name || '';
    
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sipProvider">SIP Provider</Label>
        {disableSipProviderSelect ? (
          <div className="flex items-center border rounded-md p-2 bg-muted/50">
            <span>{selectedProviderName || 'Selected provider'}</span>
          </div>
        ) : (
          <Select
            value={formData.sipProviderId}
            onValueChange={(value) => onChange('sipProviderId', value)}
            disabled={isLoadingProviders || disableSipProviderSelect}
          >
            <SelectTrigger id="sipProvider" className="w-full">
              <SelectValue placeholder="Select a SIP provider" />
            </SelectTrigger>
            <SelectContent>
              {sipProviders.length === 0 ? (
                <SelectItem value="no-providers" disabled>
                  No SIP providers available
                </SelectItem>
              ) : (
                sipProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contactList">Contact List</Label>
        <Select
          value={formData.contactListId}
          onValueChange={(value) => onChange('contactListId', value)}
          disabled={isLoadingLists}
        >
          <SelectTrigger id="contactList" className="w-full">
            <SelectValue placeholder="Select a contact list" />
          </SelectTrigger>
          <SelectContent>
            {contactLists.length === 0 ? (
              <SelectItem value="no-lists" disabled>
                No contact lists available
              </SelectItem>
            ) : (
              contactLists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name} ({list.contactCount} contacts)
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="transferNumber">Transfer Number</Label>
        <Input
          id="transferNumber"
          value={formData.transferNumber}
          onChange={(e) => onChange('transferNumber', e.target.value)}
          placeholder="e.g. +1234567890"
        />
      </div>
      
      <Button
        onClick={onStart}
        disabled={!isFormValid || isLoadingProviders || isLoadingLists}
        className="w-full"
      >
        {isLoadingProviders || isLoadingLists ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <Phone className="h-4 w-4 mr-2" />
            Start Dialing
          </>
        )}
      </Button>
    </div>
  );
};

export default DialerForm;
