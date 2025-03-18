
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
          <div className="space-y-1">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as 'credit' | 'ach')}
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

          {paymentMethod === 'credit' && (
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
          )}

          {paymentMethod === 'ach' && (
            <div className="space-y-1">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input id="accountNumber" name="accountNumber" required />
              <Label htmlFor="routingNumber" className="mt-2">Routing Number</Label>
              <Input id="routingNumber" name="routingNumber" required />
              <p className="text-xs text-muted-foreground mt-1">
                Your account will be debited ${amount.toFixed(2)} monthly.
              </p>
            </div>
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
