
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TransferFormFieldsProps {
  name: string;
  number: string;
  description: string;
  onNameChange: (value: string) => void;
  onNumberChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  isSubmitting: boolean;
}

export const TransferFormFields = ({
  name,
  number,
  description,
  onNameChange,
  onNumberChange,
  onDescriptionChange,
  isSubmitting
}: TransferFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="E.g., Sales Team, Support Desk"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <p className="text-sm text-muted-foreground mt-1">
          A descriptive name to identify this transfer destination
        </p>
      </div>

      <div>
        <Label htmlFor="number">Phone Number</Label>
        <Input
          id="number"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={number}
          onChange={(e) => onNumberChange(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <p className="text-sm text-muted-foreground mt-1">
          Include country code for international numbers
        </p>
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          placeholder="Additional details about this transfer number"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
};
