
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LimitReachedDialog } from "@/components/LimitReachedDialog";
import { useSubscription } from "@/hooks/useSubscription";
import { CallStatisticsCard } from '@/components/dashboard/CallStatisticsCard';

export const DashboardContent = () => {
  const { user, profile } = useAuth();
  const { showLimitDialog, closeLimitDialog, currentPlan, subscription, getPlanById } = useSubscription();
  
  // Check if the user has a lifetime subscription
  const isLifetimePlan = currentPlan === 'lifetime' || subscription?.plan_id === 'lifetime';
  const activePlan = currentPlan ? getPlanById(currentPlan) : null;

  return (
    <>
      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Welcome!</CardTitle>
                <CardDescription>
                  {user?.email ? `Hello, ${user.email}` : 'Welcome to the Dashboard'}
                </CardDescription>
              </div>
              
              {activePlan && (
                <div className="mt-2 md:mt-0 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium inline-flex items-center">
                  Current Plan: {activePlan.name}
                  {activePlan.price ? ` ($${activePlan.price}${isLifetimePlan ? ' one-time' : '/month'})` : ''}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p>
              This is your dashboard. You can manage your campaign, view analytics, and more.
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
                      <p>You have a regular account. <Link to="/billing" className="font-medium text-blue-700 underline">Upgrade to Lifetime</Link>.</p>
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
