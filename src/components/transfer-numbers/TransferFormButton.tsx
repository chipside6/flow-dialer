
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

interface TransferFormButtonProps {
  isSubmitting: boolean;
  isDisabled: boolean;
}

export const TransferFormButton = ({ isSubmitting, isDisabled }: TransferFormButtonProps) => {
  return (
    <Button 
      type="submit" 
      disabled={isDisabled} 
      className="w-full sm:w-auto text-left"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Adding...</span>
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          <span>Add Transfer Number</span>
        </>
      )}
    </Button>
  );
};
