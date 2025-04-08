
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

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
  const handlePaymentSubmit = () => {
    // Simulate payment process
    const paymentDetails = {
      id: 'sim_payment_' + Date.now(),
      amount: planPrice,
      currency: 'USD',
      method: 'crypto',
      timestamp: new Date().toISOString()
    };
    
    onPaymentComplete(paymentDetails);
  };
  
  return (
    <div className="max-w-md mx-auto">
      <Button variant="outline" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Plan
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Purchase</CardTitle>
          <CardDescription>
            You're purchasing the {planName} plan for ${planPrice}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This is a simplified payment form for demonstration purposes.
              In a production environment, you would integrate with a payment processor.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handlePaymentSubmit} className="w-full">
            Complete Purchase
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
