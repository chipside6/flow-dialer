
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TrialExpiredNotice = () => {
  const navigate = useNavigate();
  
  const handleUpgrade = () => {
    navigate('/upgrade');
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 text-amber-500">
          <AlertTriangle className="h-5 w-5" />
          <CardTitle>Your Trial Has Expired</CardTitle>
        </div>
        <CardDescription>
          You've reached the end of your 3-day trial period
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          Your free trial has expired. To continue running campaigns and accessing all features, 
          please upgrade to our lifetime plan.
        </p>
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium text-base">Lifetime Access Benefits:</h3>
          <ul className="mt-2 space-y-1 list-disc pl-5 text-sm">
            <li>Unlimited campaigns</li>
            <li>No monthly fees</li>
            <li>All future updates included</li>
            <li>Priority support</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleUpgrade} variant="default">
          Upgrade to Lifetime Access
        </Button>
      </CardFooter>
    </Card>
  );
};
