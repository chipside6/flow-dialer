
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreditCardFormProps {
  amount: number;
}

export const CreditCardForm = ({ amount }: CreditCardFormProps) => {
  return (
    <div className="space-y-1">
      <Label>Card Details</Label>
      <div className="p-3 border rounded-md bg-gray-50">
        <div className="text-sm text-gray-500">
          Demo Card Form (Actual Square form would render here)
        </div>
        <Input 
          placeholder="Card number" 
          className="mt-2"
          required
        />
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Input placeholder="MM/YY" required />
          <Input placeholder="CVV" required />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Your card will be charged ${amount.toFixed(2)} monthly.
      </p>
    </div>
  );
};
