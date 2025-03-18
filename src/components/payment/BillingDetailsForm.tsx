
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface BillingDetailsProps {
  billingDetails: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BillingDetailsForm = ({ billingDetails, handleInputChange }: BillingDetailsProps) => {
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="name">Full Name</Label>
        <Input 
          id="name" 
          name="name" 
          value={billingDetails.name}
          onChange={handleInputChange}
          required 
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          value={billingDetails.email}
          onChange={handleInputChange}
          required 
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="address">Billing Address</Label>
        <Input 
          id="address" 
          name="address" 
          value={billingDetails.address}
          onChange={handleInputChange}
          required 
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label htmlFor="city">City</Label>
          <Input 
            id="city" 
            name="city" 
            value={billingDetails.city}
            onChange={handleInputChange}
            required 
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="state">State</Label>
          <Input 
            id="state" 
            name="state" 
            value={billingDetails.state}
            onChange={handleInputChange}
            required 
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="zip">ZIP Code</Label>
          <Input 
            id="zip" 
            name="zip" 
            value={billingDetails.zip}
            onChange={handleInputChange}
            required 
          />
        </div>
      </div>
    </>
  );
};
