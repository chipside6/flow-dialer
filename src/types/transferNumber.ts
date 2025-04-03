
export interface TransferNumber {
  id: string;
  name: string;
  number?: string;        // For compatibility with some components
  phone_number?: string;  // For compatibility with database fields
  description?: string;
  dateAdded?: Date;
  callCount?: number;
}
