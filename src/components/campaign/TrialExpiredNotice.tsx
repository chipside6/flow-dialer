
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TrialExpiredNotice = () => {
  const navigate = useNavigate();
  
  const handleUpgrade = () => {
    navigate('/upgrade');
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <Lock className="h-5 w-5" />
          <CardTitle>Unlock Campaign Execution</CardTitle>
        </div>
        <CardDescription>
          You need to upgrade to our lifetime plan to run campaigns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          Your account allows you to set up everything needed for your campaigns, including configuring audio files, 
          adding transfer numbers, and preparing contact lists. However, to start running campaigns, you need to 
          upgrade to our lifetime plan.
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
