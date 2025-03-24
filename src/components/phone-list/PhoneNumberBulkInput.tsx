
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface PhoneNumberBulkInputProps {
  bulkNumbers: string;
  setBulkNumbers: (value: string) => void;
  handleBulkAdd: () => void;
}

export const PhoneNumberBulkInput: React.FC<PhoneNumberBulkInputProps> = ({
  bulkNumbers,
  setBulkNumbers,
  handleBulkAdd,
}) => {
  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Enter multiple phone numbers (separated by newlines, commas, or semicolons)"
        value={bulkNumbers}
        onChange={(e) => setBulkNumbers(e.target.value)}
        className="min-h-[100px]"
      />
      <Button onClick={handleBulkAdd}>Add All Numbers</Button>
    </div>
  );
};
