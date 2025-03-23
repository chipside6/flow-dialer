
import React from "react";
import { Button } from "@/components/ui/button";
import { PhoneForwarded, Loader2 } from "lucide-react";

interface TransferFormButtonProps {
  isSubmitting: boolean;
  isDisabled: boolean;
}

export const TransferFormButton = ({ 
  isSubmitting, 
  isDisabled 
}: TransferFormButtonProps) => {
  return (
    <Button 
      type="submit"
      disabled={isDisabled}
      className="w-full sm:w-auto mt-4"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <PhoneForwarded className="mr-2 h-4 w-4" />
          Add Transfer Number
        </>
      )}
    </Button>
  );
};
