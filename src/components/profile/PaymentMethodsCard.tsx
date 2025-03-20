import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  PlusCircle, 
  Edit2, 
  Trash2,
  Loader2,
  AlertCircle 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";

// Sample type for payment methods
type PaymentMethod = {
  id: string;
  type: "card";
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

export function PaymentMethodsCard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  // Form state for new/edit payment method
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
  });

  // Simulate loading payment methods
  React.useEffect(() => {
    const loadPaymentMethods = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll show empty state
      setPaymentMethods([]);
      setIsLoading(false);
    };
    
    if (user) {
      loadPaymentMethods();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call to save payment method
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      toast({
        title: editingMethod ? "Payment method updated" : "Payment method added",
        description: editingMethod 
          ? "Your payment details have been updated successfully." 
          : "Your new payment method has been added.",
      });
      
      // Close dialog
      const closeButton = document.querySelector('button[aria-label="Close"]') as HTMLButtonElement;
      if (closeButton) closeButton.click();
      
      // For demo purposes, we'll just keep the list empty
      // In a real app, you would update the payment methods list
    } catch (error) {
      toast({
        title: "Error saving payment method",
        description: "There was a problem saving your payment details.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setEditingMethod(null);
      setFormData({
        cardNumber: "",
        cardName: "",
        expiry: "",
        cvc: "",
      });
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    // Simulate API call to delete payment method
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Show success message
    toast({
      title: "Payment method removed",
      description: "Your payment method has been removed successfully.",
    });
    
    // Update local state by removing the deleted method
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  const handleSetDefault = async (id: string) => {
    // Simulate API call to set default payment method
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Update local state by setting the selected method as default
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    
    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been updated.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>
          Manage your payment methods for subscription billing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="bg-muted/50 rounded-full h-12 w-12 flex items-center justify-center mx-auto">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">No payment methods</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add a payment method to manage your subscription.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-muted w-10 h-10 rounded-md flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {method.brand} •••• {method.last4}
                      {method.isDefault && (
                        <Badge className="ml-2 bg-primary/10 text-primary text-xs">Default</Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires {method.expMonth}/{method.expYear}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!method.isDefault && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingMethod(method)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/80"
                    onClick={() => handleDeletePaymentMethod(method.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
              </DialogTitle>
              <DialogDescription>
                {editingMethod 
                  ? "Update your payment method details below." 
                  : "Enter your card details to add a new payment method."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input
                    id="cardName"
                    name="cardName"
                    placeholder="John Doe"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      name="expiry"
                      placeholder="MM/YY"
                      value={formData.expiry}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      name="cvc"
                      placeholder="123"
                      value={formData.cvc}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-start space-x-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-muted-foreground">
                    Your payment information is processed securely. We do not store your full card details.
                  </p>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingMethod ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>{editingMethod ? "Update Card" : "Add Card"}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
