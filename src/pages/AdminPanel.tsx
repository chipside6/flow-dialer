
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Info, ShieldCheck, Users, Star, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface UserWithProfile {
  id: string;
  email?: string;
  created_at?: string;
  profile?: {
    full_name: string | null;
    is_admin: boolean;
  };
  subscription?: {
    plan_id: string;
    plan_name: string;
    status: string;
  };
}

const AdminPanel = () => {
  const { isAdmin, isAuthenticated, isLoading, initialized, user } = useAuth();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated || !isAdmin) return;
      
      try {
        setIsLoadingUsers(true);
        setError(null);
        
        // Fetch profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");
        
        if (profilesError) throw profilesError;
        
        // Fetch active subscriptions
        const { data: subscriptions, error: subscriptionsError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("status", "active");
          
        if (subscriptionsError) throw subscriptionsError;
        
        // Merge data
        const usersWithData = profiles.map(profile => {
          const userSubscription = subscriptions.find(sub => sub.user_id === profile.id);
          
          return {
            id: profile.id,
            profile: {
              full_name: profile.full_name,
              is_admin: profile.is_admin
            },
            subscription: userSubscription ? {
              plan_id: userSubscription.plan_id,
              plan_name: userSubscription.plan_name,
              status: userSubscription.status
            } : undefined
          };
        });
        
        setUsers(usersWithData || []);
      } catch (err: any) {
        console.error("Error fetching users:", err);
        setError(new Error(err.message || "Failed to load users"));
        toast({
          variant: "destructive",
          title: "Error loading users",
          description: err.message || "Could not fetch user data"
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    if (isAuthenticated && isAdmin && initialized && !isLoading) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin, initialized, isLoading, toast]);
  
  const createAdminUser = async () => {
    try {
      toast({
        title: "Creating Admin User",
        description: "Please wait...",
      });
      
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: 'admin@gmail.com',
          password: 'test123'
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Admin user created: admin@gmail.com / test123",
      });
      
      // Refresh user list
      const { data: profiles } = await supabase.from("profiles").select("*");
      setUsers(profiles || []);
      
    } catch (err: any) {
      console.error("Error creating admin:", err);
      toast({
        variant: "destructive",
        title: "Failed to create admin",
        description: err.message || "An unexpected error occurred"
      });
    }
  };
  
  const grantLifetimeAccess = async (userId: string) => {
    if (!user) return;
    
    try {
      setIsProcessing(userId);
      
      const { data, error } = await supabase.functions.invoke('grant-lifetime-access', {
        body: {
          targetUserId: userId,
          adminToken: user.id  // Use the admin's user ID as the token
        }
      });
      
      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || "Failed to grant lifetime access");
      }
      
      toast({
        title: "Success!",
        description: "Lifetime access granted to user",
      });
      
      // Refresh the users list to show updated subscription status
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("status", "active");
        
      const updatedUsers = profiles?.map(profile => {
        const userSubscription = subscriptions?.find(sub => sub.user_id === profile.id);
        
        return {
          id: profile.id,
          profile: {
            full_name: profile.full_name,
            is_admin: profile.is_admin
          },
          subscription: userSubscription ? {
            plan_id: userSubscription.plan_id,
            plan_name: userSubscription.plan_name,
            status: userSubscription.status
          } : undefined
        };
      });
      
      setUsers(updatedUsers || []);
    } catch (err: any) {
      console.error("Error granting lifetime access:", err);
      toast({
        variant: "destructive",
        title: "Failed to grant access",
        description: err.message || "An unexpected error occurred"
      });
    } finally {
      setIsProcessing(null);
    }
  };
  
  // Show loading state while checking permissions
  if (isLoading || !initialized) {
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Checking admin permissions...</p>
      </div>
    );
  }
  
  // Redirect non-admin users to the unauthorized page
  if (!isAuthenticated || isAdmin === false) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">
              Manage users and system settings
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={createAdminUser}>
              <ShieldCheck className="w-4 h-4 mr-2" />
              Create Admin User
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                <Users className="w-4 h-4 inline mr-2" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                <ShieldCheck className="w-4 h-4 inline mr-2" />
                Admin Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {users.filter(user => user.profile?.is_admin).length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                <Star className="w-4 h-4 inline mr-2" />
                Lifetime Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {users.filter(user => user.subscription?.plan_id === 'lifetime').length}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.message}
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="w-full py-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              <Table>
                <TableCaption>List of all users in the system</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-xs">
                        {user.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{user.profile?.full_name || 'N/A'}</TableCell>
                      <TableCell>
                        {user.profile?.is_admin && (
                          <Badge className="bg-primary">Admin</Badge>
                        )}
                        {!user.profile?.is_admin && (
                          <Badge variant="outline">User</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.subscription ? (
                          <Badge 
                            className={user.subscription.plan_id === 'lifetime' ? 
                              'bg-gradient-to-r from-purple-400 to-pink-500 text-white' : 
                              'bg-green-100 text-green-800'
                            }
                          >
                            {user.subscription.plan_name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100">
                            Free
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={
                                isProcessing === user.id || 
                                user.subscription?.plan_id === 'lifetime'
                              }
                              className={
                                user.subscription?.plan_id === 'lifetime' ? 
                                'opacity-50 cursor-not-allowed' : ''
                              }
                            >
                              {isProcessing === user.id ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Processing
                                </>
                              ) : (
                                <>
                                  <Star className="mr-2 h-3 w-3" />
                                  {user.subscription?.plan_id === 'lifetime' ? 
                                    'Has Lifetime' : 
                                    'Grant Lifetime'
                                  }
                                </>
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Grant Lifetime Access</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to grant lifetime access to this user?
                                This cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="default"
                                onClick={() => grantLifetimeAccess(user.id)}
                              >
                                Yes, Grant Lifetime Access
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
