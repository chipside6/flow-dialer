
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
import { Loader2, Info, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const AdminPanel = () => {
  const { isAdmin, isAuthenticated, isLoading, initialized } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated || !isAdmin) return;
      
      try {
        setIsLoadingUsers(true);
        setError(null);
        
        // Fetch profiles (more reliable than auth.users)
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");
        
        if (profilesError) throw profilesError;
        
        setUsers(profiles || []);
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
          
          <Button onClick={createAdminUser}>
            <ShieldCheck className="w-4 h-4 mr-2" />
            Create Admin User
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
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
                {users.filter(user => user.is_admin).length}
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
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-xs">
                        {user.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{user.full_name || 'N/A'}</TableCell>
                      <TableCell>
                        {user.is_admin && (
                          <Badge className="bg-primary">Admin</Badge>
                        )}
                        {!user.is_admin && (
                          <Badge variant="outline">User</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.created_at 
                          ? new Date(user.created_at).toLocaleDateString() 
                          : 'N/A'
                        }
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
