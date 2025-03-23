
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bitcoin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PaymentMethodsCard() {
  const navigate = useNavigate();

  const goToUpgradePage = () => {
    navigate('/upgrade');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>
          We only accept cryptocurrency payments for subscription billing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 space-y-4">
          <div className="bg-primary/10 rounded-full h-12 w-12 flex items-center justify-center mx-auto">
            <Bitcoin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Cryptocurrency Payments Only</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We currently only accept cryptocurrency as a payment method for all plans.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={goToUpgradePage}
          className="w-full sm:w-auto"
        >
          Upgrade to Lifetime Plan
        </Button>
      </CardFooter>
    </Card>
  );
}
