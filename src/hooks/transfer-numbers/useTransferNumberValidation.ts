
import { toast } from "@/hooks/use-toast";

export function useTransferNumberValidation() {
  const validateTransferNumberInput = (name: string, number: string): boolean => {
    // Check if name is provided
    if (!name || name.trim() === "") {
      toast({
        title: "Name required",
        description: "Please provide a name for the transfer number",
        variant: "destructive"
      });
      return false;
    }

    // Check if number is provided
    if (!number || number.trim() === "") {
      toast({
        title: "Number required",
        description: "Please provide a phone number",
        variant: "destructive"
      });
      return false;
    }

    // Simple phone number format validation
    // Allow for international format with + and -, and spaces
    const phoneRegex = /^[+]?[\d\s-()]{7,20}$/;
    if (!phoneRegex.test(number.trim())) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number (e.g. +1 555-123-4567)",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return {
    validateTransferNumberInput
  };
}
