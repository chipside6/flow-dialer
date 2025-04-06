
import React from "react";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ExpiredTrialView() {
  const navigate = useNavigate();

  const goToUpgradePage = () => {
    navigate('/upgrade');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trial Expired</CardTitle>
        <CardDescription>
          Your trial has expired. Upgrade to continue using all features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-muted-foreground mb-4">
          <AlertTriangle className="h-5 w-5" />
          <span>Your 3-day trial has ended</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={goToUpgradePage} variant="success">Upgrade to Lifetime</Button>
      </CardFooter>
    </Card>
  );
}
