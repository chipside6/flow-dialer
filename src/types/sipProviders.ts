
export interface SipProvider {
  id: string;
  name: string;
  host: string;
  port: string;
  username: string;
  password: string;
  description: string;
  dateAdded: Date;
  isActive: boolean;
}
