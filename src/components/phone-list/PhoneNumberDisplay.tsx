
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface PhoneNumberDisplayProps {
  phoneNumbers: string[];
  handleRemoveNumber: (index: number) => void;
}

export const PhoneNumberDisplay: React.FC<PhoneNumberDisplayProps> = ({
  phoneNumbers,
  handleRemoveNumber,
}) => {
  if (phoneNumbers.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No phone numbers added yet
      </div>
    );
  }

  return (
    <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto">
      <ul className="divide-y">
        {phoneNumbers.map((number, index) => (
          <li key={index} className="py-2 flex justify-between items-center">
            <span>{number}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleRemoveNumber(index)}
            >
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};
