
import React from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const AffiliateNotice = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-3xl mx-auto text-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Affiliate Access</CardTitle>
          <CardDescription>
            As an affiliate, you have access to all features without a subscription.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">Your account has special affiliate status with access to all enterprise features.</p>
          <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-medium mb-6">All Enterprise Features Unlocked</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
