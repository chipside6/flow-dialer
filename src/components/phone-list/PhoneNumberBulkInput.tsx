
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface PhoneNumberBulkInputProps {
  bulkNumbers: string;
  setBulkNumbers: (value: string) => void;
  handleBulkAdd: () => void;
  isActionInProgress: boolean;
}

export const PhoneNumberBulkInput: React.FC<PhoneNumberBulkInputProps> = ({
  bulkNumbers,
  setBulkNumbers,
  handleBulkAdd,
  isActionInProgress,
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateAndAddBulkNumbers = () => {
    // Reset previous validation error
    setValidationError(null);

    if (!bulkNumbers.trim()) {
      setValidationError("Please enter at least one phone number");
      return;
    }

    // Basic phone number validation - can be improved with a library like libphonenumber-js
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    
    // Split the input by newlines, commas, or semicolons
    const numberArray = bulkNumbers
      .split(/[\n,;]+/)
      .map(num => num.trim())
      .filter(num => num.length > 0);
    
    if (numberArray.length === 0) {
      setValidationError("Please enter at least one valid phone number");
      return;
    }
    
    // Check if there are any invalid numbers
    const invalidNumbers = numberArray.filter(num => !phoneRegex.test(num));
    
    if (invalidNumbers.length > 0) {
      const pluralS = invalidNumbers.length > 1 ? 's' : '';
      setValidationError(`${invalidNumbers.length} invalid number${pluralS} found. Please correct them.`);
      
      toast({
        title: "Invalid phone numbers detected",
        description: `Please correct the invalid phone number${pluralS} before adding.`,
        variant: "destructive"
      });
      
      return;
    }

    // If all validations pass, proceed with adding numbers
    handleBulkAdd();
  };

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Enter multiple phone numbers (separated by newlines, commas, or semicolons)"
        value={bulkNumbers}
        onChange={(e) => {
          setBulkNumbers(e.target.value);
          // Clear validation error as user types
          if (validationError) setValidationError(null);
        }}
        className="min-h-[100px]"
        disabled={isActionInProgress}
      />
      
      {validationError && (
        <div className="text-sm flex items-center text-destructive">
          <AlertCircle className="h-4 w-4 mr-1" />
          {validationError}
        </div>
      )}
      
      <Button 
        onClick={validateAndAddBulkNumbers}
        disabled={isActionInProgress || !bulkNumbers.trim()}
        className="w-full"
      >
        {isActionInProgress ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Add All Numbers"
        )}
      </Button>
    </div>
  );
};
