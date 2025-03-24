
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Enter multiple phone numbers (separated by newlines, commas, or semicolons)"
        value={bulkNumbers}
        onChange={(e) => setBulkNumbers(e.target.value)}
        className="min-h-[100px]"
        disabled={isActionInProgress}
      />
      <Button 
        onClick={handleBulkAdd}
        disabled={isActionInProgress}
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
