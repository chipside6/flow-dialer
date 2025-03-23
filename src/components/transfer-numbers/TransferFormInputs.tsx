
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TransferFormInputsProps {
  name: string;
  setName: (name: string) => void;
  number: string;
  setNumber: (number: string) => void;
  description: string;
  setDescription: (description: string) => void;
  isSubmitting: boolean;
}

export const TransferFormInputs = ({
  name,
  setName,
  number,
  setNumber,
  description,
  setDescription,
  isSubmitting
}: TransferFormInputsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="transfer-name">Name</Label>
        <Input
          id="transfer-name"
          placeholder="Enter a name for this transfer destination"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          required
          className="mb-0"
        />
      </div>
      <div>
        <Label htmlFor="transfer-number">Phone Number</Label>
        <Input
          id="transfer-number"
          placeholder="Enter the phone number (e.g., +1-555-123-4567)"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          disabled={isSubmitting}
          required
          type="tel"
          className="mb-0"
        />
      </div>
      <div>
        <Label htmlFor="transfer-description">Description</Label>
        <Input
          id="transfer-description"
          placeholder="Enter a description for this transfer number"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          className="mb-0"
        />
      </div>
    </>
  );
};
