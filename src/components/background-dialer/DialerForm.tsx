
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Phone } from "lucide-react";
import { ContactList, DialerFormData } from "./types";

interface DialerFormProps {
  contactLists: ContactList[];
  formData: DialerFormData;
  isLoadingLists?: boolean;
  onChange: (field: string, value: any) => void;
  onStart: () => void;
}

const DialerForm: React.FC<DialerFormProps> = ({
  contactLists,
  formData,
  isLoadingLists = false,
  onChange,
  onStart
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const isStartDisabled = 
    !formData.contactListId || 
    !formData.transferNumber ||
    isLoadingLists;

  return (
    <div className="space-y-4">
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
