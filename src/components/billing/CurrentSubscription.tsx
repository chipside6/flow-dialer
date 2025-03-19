
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { PricingPlan } from "@/data/pricingPlans";
import { Loader2 } from "lucide-react";

export const CurrentSubscription = () => {
  const { isLoading, currentPlan, fetchCurrentSubscription, getPlanById } = useSubscription();
  const [activePlan, setActivePlan] = useState<PricingPlan | null>(null);

  useEffect(() => {
    const loadSubscription = async () => {
      const subscription = await fetchCurrentSubscription();
      if (subscription && subscription.plan_id) {
        const plan = getPlanById(subscription.plan_id);
        if (plan) setActivePlan(plan);
      }
    };
    
    loadSubscription();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentPlan || !activePlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            You don't have an active subscription. Choose a plan below to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Current Subscription</CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Active
          </Badge>
        </div>
        <CardDescription>
          Your current subscription details and usage information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">{activePlan.name} Plan</h3>
            <p className="text-muted-foreground">${activePlan.price}/month</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Plan Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {activePlan.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild>
          <a href="#upgrade-plans">Upgrade Plan</a>
        </Button>
      </CardFooter>
    </Card>
  );
};
