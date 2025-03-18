
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ACHDebitFormProps {
  amount: number;
}

export const ACHDebitForm = ({ amount }: ACHDebitFormProps) => {
  return (
    <div className="space-y-1">
      <Label htmlFor="accountNumber">Account Number</Label>
      <Input id="accountNumber" name="accountNumber" required />
      <Label htmlFor="routingNumber" className="mt-2">Routing Number</Label>
      <Input id="routingNumber" name="routingNumber" required />
      <p className="text-xs text-muted-foreground mt-1">
        Your account will be debited ${amount.toFixed(2)} monthly.
      </p>
    </div>
  );
};
