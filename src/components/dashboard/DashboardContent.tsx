
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LimitReachedDialog } from "@/components/LimitReachedDialog";
import { useSubscription } from "@/hooks/subscription";
import { CallStatisticsCard } from '@/components/dashboard/CallStatisticsCard';

export const DashboardContent = () => {
  const { user } = useAuth();
  const { 
    showLimitDialog, 
    closeLimitDialog, 
    currentPlan, 
    subscription,
    fetchCurrentSubscription
  } = useSubscription();
  
  // Initial data fetch on component mount
  useEffect(() => {
    // Always try to fetch subscription data regardless of user state
    fetchCurrentSubscription().catch(err => {
      console.error("Failed to fetch subscription:", err);
    });
  }, [fetchCurrentSubscription]);
  
  // Check if the user has a lifetime subscription
  const isLifetimePlan = currentPlan === 'lifetime' || subscription?.plan_id === 'lifetime';
  
  return (
    <>
      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>
              {user?.email ? `Hello, ${user.email}` : 'Welcome to the Dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This is your dashboard. You can manage your campaigns, view analytics, and more.
            </p>
          </CardContent>
        </Card>

        {/* Call Statistics Card */}
        <CallStatisticsCard />

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>View your subscription status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="text-sm text-blue-700">
                    {isLifetimePlan ? (
                      <p>You have lifetime access to all features.</p>
                    ) : (
                      <p>You can set up your account but need to <Link to="/upgrade" className="font-medium text-blue-700 underline">upgrade to Lifetime</Link> to run campaigns.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your account and campaigns.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Button asChild variant="success">
              <Link to="/campaign">Create a Campaign</Link>
            </Button>
            <Button asChild>
              <Link to="/campaigns">Go to Campaigns</Link>
            </Button>
            <Button asChild>
              <Link to="/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <LimitReachedDialog 
        open={showLimitDialog} 
        onClose={closeLimitDialog} 
      />
    </>
  );
};
