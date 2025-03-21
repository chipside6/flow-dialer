
import React from 'react';
import { Button } from '@/components/ui/button';
import { CryptoPaymentForm } from '@/components/payment/CryptoPaymentForm';

interface PaymentSectionProps {
  onBack: () => void;
  planPrice: number;
  planName: string;
  onPaymentComplete: (paymentDetails: any) => Promise<void>;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  onBack,
  planPrice,
  planName,
  onPaymentComplete
}) => {
  return (
    <div className="max-w-md mx-auto">
      <Button variant="outline" onClick={onBack} className="mb-6">
        ← Back to Plan
      </Button>
      <CryptoPaymentForm 
        planPrice={planPrice}
        planName={planName}
        onPaymentComplete={onPaymentComplete}
      />
    </div>
  );
};
