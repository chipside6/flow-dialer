
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateAndAddNumber = () => {
    // Reset previous validation error
    setValidationError(null);

    // Basic phone number validation - can be improved with a library like libphonenumber-js
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    
    if (!newNumber.trim()) {
      setValidationError("Please enter a phone number");
      return;
    }
    
    if (!phoneRegex.test(newNumber.trim())) {
      setValidationError("Please enter a valid phone number");
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number format",
        variant: "destructive"
      });
      return;
    }

    // If validation passes, proceed with adding the number
    handleAddNumber();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Enter phone number (e.g. +15551234567)"
          value={newNumber}
          onChange={(e) => {
            setNewNumber(e.target.value);
            // Clear validation error as user types
            if (validationError) setValidationError(null);
          }}
          className="flex-1"
          disabled={isActionInProgress}
        />
        <Button 
          onClick={validateAndAddNumber}
          disabled={isActionInProgress || !newNumber.trim()}
        >
          {isActionInProgress ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add
        </Button>
      </div>
      
      {validationError && (
        <div className="text-sm flex items-center text-destructive">
          <AlertCircle className="h-4 w-4 mr-1" />
          {validationError}
        </div>
      )}
    </div>
  );
};
