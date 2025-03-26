
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useAuth } from "@/contexts/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider } from "@/components/ui/sidebar";

const Profile = () => {
  const { user, profile, isAdmin } = useAuth();
  const { currentPlan, getPlanById } = useSubscription();
  
  const activePlan = currentPlan ? getPlanById(currentPlan) : null;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SidebarProvider>
        <div className="flex flex-1 w-full">
          <DashboardLayout>
            <div className="container mx-auto py-4 space-y-8">
              <div className="flex flex-col md:flex-row gap-6 md:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-xl">
                    {profile?.full_name ? getInitials(profile.full_name) : user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {profile?.full_name || 'User Profile'}
                  </h1>
                  <p className="text-muted-foreground">
                    {user?.email}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {isAdmin && (
                      <Badge className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                        Admin
                      </Badge>
                    )}
                    {activePlan && (
                      <Badge className="bg-green-500/10 text-green-600 px-2 py-1 rounded-md text-xs">
                        {activePlan.name} Plan
                      </Badge>
                    )}
                    {!activePlan && (
                      <Badge className="bg-gray-500/10 text-gray-600 px-2 py-1 rounded-md text-xs">
                        Free Tier
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <ProfileForm />
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>Your account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Account ID</h3>
                        <p className="text-sm truncate">{user?.id}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Created At</h3>
                        <p className="text-sm">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Last Sign In</h3>
                        <p className="text-sm">
                          {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      {activePlan && (
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground">Current Plan</h3>
                          <p className="text-sm">{activePlan.name} (${activePlan.price}/month)</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </DashboardLayout>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Profile;
