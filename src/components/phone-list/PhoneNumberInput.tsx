
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PhoneNumberInputProps {
  newNumber: string;
  setNewNumber: (value: string) => void;
  handleAddNumber: () => void;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  newNumber,
  setNewNumber,
  handleAddNumber,
}) => {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Enter phone number"
        value={newNumber}
        onChange={(e) => setNewNumber(e.target.value)}
        className="flex-1"
      />
      <Button onClick={handleAddNumber}>
        <Plus className="h-4 w-4 mr-2" /> Add
      </Button>
    </div>
  );
};
