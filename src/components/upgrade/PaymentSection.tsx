
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
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
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Plan
      </Button>
      
      {/* Use CryptoPaymentForm for cryptocurrency payments */}
      <CryptoPaymentForm 
        planPrice={planPrice} 
        planName={planName} 
        onPaymentComplete={onPaymentComplete} 
      />
    </div>
  );
};
