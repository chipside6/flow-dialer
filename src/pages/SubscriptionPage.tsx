
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SubscriptionPage = () => {
  const { subscription, isLoading } = useSubscription();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="pt-6">
            <p>Loading subscription details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Subscription</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your current subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div>
                <p className="font-medium">Plan:</p>
                <p className="text-2xl font-bold">{subscription.planName}</p>
              </div>
              <div>
                <p className="font-medium">Status:</p>
                <p className="capitalize">{subscription.status}</p>
              </div>
              {subscription.renewalDate && (
                <div>
                  <p className="font-medium">Renews On:</p>
                  <p>{new Date(subscription.renewalDate).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="font-medium">Features:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {subscription.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <p>You don't have an active subscription.</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/pricing')}
              >
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => navigate('/pricing')}
        >
          Change Plan
        </Button>
        
        {subscription && (
          <Button 
            variant="destructive"
            onClick={() => {
              // This would be implemented with the actual subscription service
              alert("This would cancel your subscription after the current billing period");
            }}
          >
            Cancel Subscription
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
