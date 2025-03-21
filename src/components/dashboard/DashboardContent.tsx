
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { LimitReachedDialog } from "@/components/LimitReachedDialog";
import { useSubscription } from "@/hooks/useSubscription";
import CampaignDashboard from "@/components/CampaignDashboard";

export const DashboardContent = () => {
  const { user, profile } = useAuth();
  const { showLimitDialog, closeLimitDialog } = useSubscription();

  return (
    <>
      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>
              {profile?.full_name ? `Hello, ${profile.full_name}` : user?.email ? `Hello, ${user.email}` : 'Welcome to the Dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This is your dashboard. You can manage your campaigns, view analytics, and more.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>View your subscription status.</CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.is_affiliate ? (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Affiliate Account
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Your account has been successfully upgraded to an affiliate account.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm text-blue-700">
                      <p>You have a regular account. <Link to="/billing" className="font-medium text-blue-700 underline">Upgrade to Lifetime</Link>.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your account and campaigns.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Button asChild variant="outline">
              <Link to="/campaign">Create a Campaign</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/campaign">Go to Campaigns</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
        
        <CampaignDashboard />
      </div>
      
      <LimitReachedDialog 
        open={showLimitDialog} 
        onClose={closeLimitDialog} 
      />
    </>
  );
};
