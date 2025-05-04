
import { Campaign } from "@/types/campaign";

/**
 * Determine badge variant based on campaign status
 */
export const badgeVariantFromStatus = (status: Campaign['status'] | undefined): "default" | "destructive" | "outline" | "secondary" | "success" => {
  if (!status) return 'outline'; // Handle the case where status is undefined
  
  switch (status) {
    case 'active':
    case 'running':
      return 'success';
    case 'paused':
      return 'secondary';
    case 'completed':
      return 'default';
    case 'failed':
      return 'destructive';
    case 'draft':
    case 'pending':
      return 'outline';
    default:
      return 'outline'; // Default fallback for any undefined status
  }
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Check if it's a valid number length (either 10 or 11 digits)
  if (cleaned.length < 10 || cleaned.length > 11) {
    return phoneNumber; // Return original if the number is not valid
  }

  // Format as a valid US phone number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Return the original phone number if it doesn't match a valid format
  return phoneNumber;
};
