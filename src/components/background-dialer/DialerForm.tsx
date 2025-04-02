
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Phone } from "lucide-react";
import { ContactList, DialerFormData, SipProvider } from "./types";

interface DialerFormProps {
  sipProviders: SipProvider[];
  contactLists: ContactList[];
  formData: DialerFormData;
  isLoadingProviders?: boolean;
  isLoadingLists?: boolean;
  onChange: (field: string, value: any) => void;
  onStart: () => void;
  disableSipProviderSelect?: boolean;
}

const DialerForm: React.FC<DialerFormProps> = ({
  sipProviders,
  contactLists,
  formData,
  isLoadingProviders = false,
  isLoadingLists = false,
  onChange,
  onStart,
  disableSipProviderSelect = false
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const isStartDisabled = 
    !formData.sipProviderId || 
    !formData.contactListId || 
    !formData.transferNumber ||
    isLoadingProviders || 
    isLoadingLists;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sipProviderId">SIP Provider</Label>
        <Select
          value={formData.sipProviderId || ""}
          onValueChange={(value) => onChange("sipProviderId", value)}
          disabled={isLoadingProviders || disableSipProviderSelect}
        >
          <SelectTrigger id="sipProviderId">
            <SelectValue placeholder="Select a SIP provider" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingProviders ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Loading...</span>
              </div>
            ) : sipProviders.length === 0 ? (
              <div className="py-2 px-2 text-sm text-muted-foreground">
                No SIP providers available
              </div>
            ) : (
              sipProviders.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactListId">Contact List</Label>
        <Select
          value={formData.contactListId || ""}
          onValueChange={(value) => onChange("contactListId", value)}
          disabled={isLoadingLists}
        >
          <SelectTrigger id="contactListId">
            <SelectValue placeholder="Select a contact list" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingLists ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Loading...</span>
              </div>
            ) : contactLists.length === 0 ? (
              <div className="py-2 px-2 text-sm text-muted-foreground">
                No contact lists available
              </div>
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
          name="transferNumber"
          value={formData.transferNumber || ""}
          onChange={handleInputChange}
          placeholder="e.g., +1234567890"
        />
        <p className="text-xs text-muted-foreground">
          Number that calls will be transferred to when users press 1
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxConcurrentCalls">Max Concurrent Calls</Label>
        <Input
          id="maxConcurrentCalls"
          name="maxConcurrentCalls"
          type="number"
          min="1"
          max="10"
          value={formData.maxConcurrentCalls || 1}
          onChange={(e) => onChange("maxConcurrentCalls", parseInt(e.target.value) || 1)}
          placeholder="1"
        />
        <p className="text-xs text-muted-foreground">
          Maximum number of simultaneous calls (1-10)
        </p>
      </div>

      <Button
        onClick={onStart}
        disabled={isStartDisabled}
        className="w-full"
      >
        <Phone className="h-4 w-4 mr-2" />
        Start Dialing
      </Button>
    </div>
  );
};

export default DialerForm;
