
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { BillingDetailsForm } from "./payment/BillingDetailsForm";
import { CryptoPaymentForm } from "./payment/CryptoPaymentForm";

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
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  useEffect(() => {
    // For demo purposes, we'll simulate the payment form being ready
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
          Enter your details to set up cryptocurrency payment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <BillingDetailsForm 
            billingDetails={billingDetails}
            handleInputChange={handleInputChange}
          />

          <div className="p-3 border rounded-md bg-gray-50">
            <p className="text-center text-sm text-gray-700">
              Payment will be processed via cryptocurrency
            </p>
          </div>
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
