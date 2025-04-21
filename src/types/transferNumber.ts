
export interface TransferNumber {
  id: string;
  name: string;
  number: string;
  phone_number?: string; // Add this for backward compatibility
  description: string;
  dateAdded: Date;
  callCount: number;
}
