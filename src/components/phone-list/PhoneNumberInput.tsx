
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

interface PhoneNumberInputProps {
  newNumber: string;
  setNewNumber: (value: string) => void;
  handleAddNumber: () => void;
  isActionInProgress: boolean;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  newNumber,
  setNewNumber,
  handleAddNumber,
  isActionInProgress,
}) => {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Enter phone number"
        value={newNumber}
        onChange={(e) => setNewNumber(e.target.value)}
        className="flex-1"
        disabled={isActionInProgress}
      />
      <Button 
        onClick={handleAddNumber}
        disabled={isActionInProgress}
      >
        {isActionInProgress ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Plus className="h-4 w-4 mr-2" />
        )}
        Add
      </Button>
    </div>
  );
};
