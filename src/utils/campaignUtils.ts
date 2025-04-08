
import { Campaign } from "@/types/campaign";

/**
 * Determine badge variant based on campaign status
 */
export const badgeVariantFromStatus = (status: Campaign['status'] | undefined): "default" | "destructive" | "outline" | "secondary" | "success" => {
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
    default:
      return 'outline';
  }
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid US number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // Return original if not matching standard formats
  return phoneNumber;
};
