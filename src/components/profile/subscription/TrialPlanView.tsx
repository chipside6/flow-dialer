
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PricingPlan } from "@/data/pricingPlans";
import { Subscription } from "@/hooks/subscription/types";
import { Clock } from "lucide-react";

interface TrialPlanViewProps {
  activePlan: PricingPlan;
  subscription: Subscription | null;
}

export function TrialPlanView({ activePlan, subscription }: TrialPlanViewProps) {
  const navigate = useNavigate();
  
  const goToUpgradePage = () => {
    navigate('/upgrade');
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Free Plan</CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Free
          </Badge>
        </div>
        <CardDescription>
          You have basic access with limited daily and monthly calls
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">{activePlan.name}</h3>
            <p className="text-muted-foreground">Limited access</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Plan Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {activePlan.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t flex items-center gap-2 text-blue-500">
            <Clock className="h-5 w-5" />
            <p className="font-medium">
              Call limits reset monthly
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={goToUpgradePage} variant="success">Upgrade to Lifetime</Button>
      </CardFooter>
    </Card>
  );
}
