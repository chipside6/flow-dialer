
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContactList } from "@/components/campaign-wizard/types";
import { DialerFormData } from "./types";
import { Phone } from "lucide-react";

interface DialerFormProps {
  contactLists: ContactList[];
  formData: DialerFormData;
  isLoadingLists: boolean;
  onChange: (field: string, value: any) => void;
  onStart: () => void;
}

const DialerForm: React.FC<DialerFormProps> = ({
  contactLists,
  formData,
  isLoadingLists,
  onChange,
  onStart
}) => {
  // Available ports for GoIP (typically 1-4 for a 4-port GoIP)
  const availablePorts = [1, 2, 3, 4];
  
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="contactList">Contact List</Label>
          <Select
            value={formData.contactListId}
            onValueChange={(value) => onChange("contactListId", value)}
            disabled={isLoadingLists}
          >
            <SelectTrigger id="contactList">
              <SelectValue placeholder="Select a contact list" />
            </SelectTrigger>
            <SelectContent>
              {contactLists.map(list => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="transferNumber">Transfer Number</Label>
          <Input
            id="transferNumber"
            placeholder="e.g. +1 (555) 123-4567"
            value={formData.transferNumber}
            onChange={(e) => onChange("transferNumber", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="portNumber">GoIP Port</Label>
          <Select 
            value={(formData.portNumber || 1).toString()}
            onValueChange={(value) => onChange("portNumber", parseInt(value))}
          >
            <SelectTrigger id="portNumber">
              <SelectValue placeholder="Select port" />
            </SelectTrigger>
            <SelectContent>
              {availablePorts.map(port => (
                <SelectItem key={port} value={port.toString()}>
                  Port {port}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Select which GoIP port to use for dialing out.
          </p>
        </div>
      </div>
      
      <Button 
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
        onClick={onStart}
        disabled={!formData.contactListId || !formData.transferNumber}
      >
        <Phone className="h-4 w-4 mr-2" />
        Start Dialing
      </Button>
    </div>
  );
};

export default DialerForm;
