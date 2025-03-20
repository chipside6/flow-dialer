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
import { Loader2, CreditCard, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export function SubscriptionDetails() {
  const { isLoading, currentPlan, subscription, getPlanById } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = React.useState(false);
  
  const activePlan = currentPlan ? getPlanById(currentPlan) : null;

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    
    try {
      // For demo purposes, we'll just show a success message
      // In a real app, this would call an API to cancel the subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
      
      // Refresh page to update UI
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast({
        title: "Error cancelling subscription",
        description: "There was a problem cancelling your subscription.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const goToUpgradePage = () => {
    navigate('/billing');
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
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            You don't currently have an active subscription plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-muted-foreground mb-4">
            <AlertTriangle className="h-5 w-5" />
            <span>You're currently on the free tier with limited features.</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={goToUpgradePage}>Upgrade Now</Button>
        </CardFooter>
      </Card>
    );
  }

  // Calculate the end date for display
  const endDate = subscription?.current_period_end 
    ? new Date(subscription.current_period_end).toLocaleDateString() 
    : 'Unknown';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Subscription</CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Active
          </Badge>
        </div>
        <CardDescription>
          Your current subscription plan and billing information
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

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Next billing date:</span> {endDate}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={goToUpgradePage}>
          Upgrade Plan
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
              Cancel Subscription
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Subscription</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your {activePlan.name} subscription? 
                You'll lose access to premium features at the end of your current billing period.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => {
                const closeButton = document.querySelector('button[aria-label="Close"]') as HTMLButtonElement;
                if (closeButton) closeButton.click();
              }}>
                Keep Subscription
              </Button>
              <Button 
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Subscription"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
