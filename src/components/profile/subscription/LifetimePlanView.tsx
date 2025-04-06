
import React from "react";
import { CheckCircle2 } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingPlan } from "@/data/pricingPlans";

interface LifetimePlanViewProps {
  activePlan: PricingPlan;
}

export function LifetimePlanView({ activePlan }: LifetimePlanViewProps) {
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
            <p className="text-muted-foreground text-center">One-time payment of ${activePlan.price}</p>
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
