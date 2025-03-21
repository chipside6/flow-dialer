
import { toast } from "@/components/ui/use-toast";

export function useTransferNumberValidation() {
  // Validate input for transfer number
  const validateTransferNumberInput = (name: string, number: string) => {
    if (!name || !number) {
      toast({
        title: "Missing information",
        description: "Please provide both a name and a number",
        variant: "destructive",
      });
      return false;
    }
    
    // Basic validation for phone number format
    const phoneRegex = /^\+?[0-9\s\-()]+$/;
    if (!phoneRegex.test(number)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  return {
    validateTransferNumberInput
  };
}
