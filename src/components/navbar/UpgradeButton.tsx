
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Sparkles } from "lucide-react";

export const UpgradeButton = () => {
  const { currentPlan, isLoading } = useSubscription();
  
  // Don't show anything while loading or if user already has lifetime plan
  if (isLoading || currentPlan === 'lifetime') {
    return null;
  }
  
  return (
    <Button 
      asChild 
      size="sm" 
      variant="outline" 
      className="hidden md:flex items-center gap-1 border-primary text-primary hover:bg-primary/10"
    >
      <Link to="/billing">
        <Sparkles className="h-4 w-4 mr-1" />
        Upgrade
      </Link>
    </Button>
  );
};
