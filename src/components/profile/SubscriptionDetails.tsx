
import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export function SubscriptionDetails() {
  const { isLoading, currentPlan, subscription, getPlanById } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = React.useState(false);
  
  const activePlan = currentPlan ? getPlanById(currentPlan) : null;

  const goToUpgradePage = () => {
    navigate('/upgrade');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!currentPlan || !activePlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Free Plan</CardTitle>
          <CardDescription>
            You're currently on the free plan with limited features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-muted-foreground mb-4">
            <AlertTriangle className="h-5 w-5" />
            <span>Limited to 500 calls per month</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={goToUpgradePage}>Upgrade to Lifetime</Button>
        </CardFooter>
      </Card>
    );
  }

  // If user has lifetime plan
  if (activePlan.isLifetime) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lifetime Access</CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Lifetime
            </Badge>
          </div>
          <CardDescription>
            You have unlimited access to all features forever
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{activePlan.name} Plan</h3>
              <p className="text-muted-foreground">One-time payment of ${activePlan.price}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Plan Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {activePlan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium">
                Lifetime access activated
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For trial plan
  if (activePlan.isTrial) {
    const endDate = subscription?.current_period_end 
      ? new Date(subscription.current_period_end).toLocaleDateString() 
      : 'Unknown';
      
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>3-Day Trial</CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Trial
            </Badge>
          </div>
          <CardDescription>
            You have full access to all features during your trial period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{activePlan.name}</h3>
              <p className="text-muted-foreground">Full access until {endDate}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Plan Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {activePlan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">
                Trial ends on {endDate}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={goToUpgradePage}>Upgrade to Lifetime</Button>
        </CardFooter>
      </Card>
    );
  }

  // For free plan with more details
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Free Plan</CardTitle>
          <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
            Limited
          </Badge>
        </div>
        <CardDescription>
          You're currently on the free plan with limited features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">{activePlan.name} Plan</h3>
            <p className="text-muted-foreground">Free access with limitations</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Plan Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {activePlan.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Limited to 500 calls per month</span>
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="default" 
          onClick={goToUpgradePage}>
          Upgrade to Lifetime
        </Button>
      </CardFooter>
    </Card>
  );
}
