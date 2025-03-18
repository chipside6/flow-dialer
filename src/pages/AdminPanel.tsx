
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface UserListItem {
  id: string;
  full_name: string | null;
  email: string | null;
  is_affiliate: boolean;
}

const AdminPanel = () => {
  const { toast } = useToast();
  const { user, profile, setAsAffiliate } = useAuth();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [emailToSearch, setEmailToSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if current user is an admin
  const isAdmin = profile?.is_admin === true;

  useEffect(() => {
    // Fetch all users if admin
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles with emails from auth user table
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      
      // Get email data for each user
      const usersWithEmail = await Promise.all(
        (data || []).map(async (profile) => {
          // In a real app, you might use an admin API to get user emails
          // This is simplified for demo purposes
          return {
            id: profile.id,
            full_name: profile.full_name,
            email: `user-${profile.id.substring(0, 6)}@example.com`, // Simulated email
            is_affiliate: profile.is_affiliate || false
          };
        })
      );
      
      setUsers(usersWithEmail);
    } catch (error: any) {
      console.error("Error fetching users:", error.message);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!emailToSearch.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email to search",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // In a real application, you would search for the user by email
      // This is a simplified version that just filters the existing users
      const foundUsers = users.filter(user => 
        user.email?.toLowerCase().includes(emailToSearch.toLowerCase())
      );
      
      if (foundUsers.length > 0) {
        setUsers(foundUsers);
      } else {
        toast({
          title: "User not found",
          description: "No user found with this email",
        });
      }
    } catch (error: any) {
      console.error("Error searching user:", error.message);
      toast({
        title: "Error",
        description: "Failed to search for user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetAffiliate = async (userId: string) => {
    try {
      await setAsAffiliate(userId);
      // Refresh the user list
      fetchUsers();
    } catch (error: any) {
      console.error("Error setting affiliate:", error.message);
    }
  };

  // Redirect or show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="py-32 px-6">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>
                  You don't have permission to access the admin panel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>This area is restricted to administrators only.</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <a href="/dashboard">Return to Dashboard</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Search for users and manage their roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-8">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="email">User Email</Label>
                  <Input 
                    id="email" 
                    placeholder="Enter email to search" 
                    value={emailToSearch}
                    onChange={(e) => setEmailToSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch} disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        {loading ? "Loading users..." : "No users found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email || "N/A"}</TableCell>
                        <TableCell>{user.full_name || "N/A"}</TableCell>
                        <TableCell>
                          {user.is_affiliate ? (
                            <Badge className="bg-green-500">Affiliate</Badge>
                          ) : (
                            <Badge variant="outline">Regular</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!user.is_affiliate && (
                            <Button
                              size="sm"
                              onClick={() => handleSetAffiliate(user.id)}
                              variant="outline"
                            >
                              Set as Affiliate
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
