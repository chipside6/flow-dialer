
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PaymentMethodSelector } from "./payment/PaymentMethodSelector";
import { BillingDetailsForm } from "./payment/BillingDetailsForm";
import { CreditCardForm } from "./payment/CreditCardForm";
import { ACHDebitForm } from "./payment/ACHDebitForm";

// Square Web Payments SDK types
declare global {
  interface Window {
    Square: any;
  }
}

type PaymentFormProps = {
  amount: number;
  planName: string;
  onSuccess: (paymentDetails: any) => void;
  onError: (error: any) => void;
}

export const SquarePaymentForm = ({ amount, planName, onSuccess, onError }: PaymentFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [cardPaymentReady, setCardPaymentReady] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'ach'>('credit');
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  // Application ID from Square Developer Dashboard (this should be your sandbox application ID for testing)
  // Note: Using dummy values as placeholders since these would be real credentials
  const applicationId = 'sandbox-sq0idb-PLACEHOLDER-APP-ID';
  const locationId = 'PLACEHOLDER-LOCATION-ID';

  useEffect(() => {
    // For demo purposes, we'll simulate the payment form being ready
    // In a real implementation, we would load the Square SDK
    const timer = setTimeout(() => {
      setCardPaymentReady(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (value: 'credit' | 'ach') => {
    setPaymentMethod(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate a successful payment
      toast({
        title: "Payment Successful",
        description: `You've subscribed to ${planName}. Thank you!`,
      });
      
      onSuccess({
        paymentMethod,
        planName,
        amount,
        timestamp: new Date().toISOString(),
        paymentId: `pay_${Math.random().toString(36).substring(2, 10)}`,
      });
    } catch (error) {
      console.error('Payment error:', error);
      onError(error);
      toast({
        title: "Payment Failed",
        description: "There was a problem processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Subscribe to {planName}</CardTitle>
        <CardDescription>
          {paymentMethod === 'credit' 
            ? 'Enter your card details to set up recurring payment'
            : 'Set up ACH direct debit for your subscription'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentMethodSelector 
            paymentMethod={paymentMethod}
            onPaymentMethodChange={handlePaymentMethodChange}
          />

          <BillingDetailsForm 
            billingDetails={billingDetails}
            handleInputChange={handleInputChange}
          />

          {paymentMethod === 'credit' && (
            <CreditCardForm amount={amount} />
          )}

          {paymentMethod === 'ach' && (
            <ACHDebitForm amount={amount} />
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isLoading || !cardPaymentReady}
        >
          {isLoading ? "Processing..." : `Subscribe - $${amount.toFixed(2)}/month`}
        </Button>
      </CardFooter>
    </Card>
  );
};
