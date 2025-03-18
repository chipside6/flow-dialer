
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentMethodSelectorProps {
  paymentMethod: 'credit' | 'ach';
  onPaymentMethodChange: (value: 'credit' | 'ach') => void;
}

export const PaymentMethodSelector = ({ 
  paymentMethod, 
  onPaymentMethodChange 
}: PaymentMethodSelectorProps) => {
  return (
    <div className="space-y-1">
      <Label htmlFor="paymentMethod">Payment Method</Label>
      <Select
        value={paymentMethod}
        onValueChange={(value) => onPaymentMethodChange(value as 'credit' | 'ach')}
      >
        <SelectTrigger id="paymentMethod">
          <SelectValue placeholder="Select payment method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="credit">Credit Card</SelectItem>
          <SelectItem value="ach">ACH Direct Debit</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
