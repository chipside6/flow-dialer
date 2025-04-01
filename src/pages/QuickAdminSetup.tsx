
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PublicLayout from "@/components/layout/PublicLayout";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

export default function QuickAdminSetup() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, signOut } = useAuth();

  const createAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!email || !password) {
      setError("Email and password are required");
      toast.error("Email and password are required");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Show a toast that we're creating the admin user
      toast.info("Creating admin user...");
      console.log("QuickAdminSetup - Invoking create-admin-user function");
      
      // Call the edge function to create an admin user
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: { email, password }
      });
      
      console.log("Admin user creation response:", data, error);
      
      if (error) {
        console.error("Error creating admin user:", error);
        throw new Error(error.message || "Failed to create admin user");
      }
      
      if (!data?.success) {
        throw new Error(data?.error || "Unknown error occurred");
      }
      
      toast.success(`Admin user created successfully!`);
      toast.info(`Email: ${email}, Password: ${password}`, {
        duration: 8000
      });
      
      // If already logged in, suggest logging out
      if (isAuthenticated) {
        setTimeout(() => {
          toast.info("You are currently logged in. Please log out first to log in as admin.", {
            duration: 8000,
            action: {
              label: "Log Out Now",
              onClick: () => {
                signOut?.();
                setTimeout(() => navigate("/login"), 500);
              }
            }
          });
        }, 1000);
      } else {
        // Otherwise redirect to login
        setTimeout(() => navigate("/login"), 2000);
      }
      
    } catch (err: any) {
      console.error("Error creating admin:", err);
      setError(err.message || "Failed to create admin user");
      toast.error(`Error: ${err.message || "Failed to create admin"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Quick Admin Setup</CardTitle>
            <CardDescription>
              Create an admin user to access restricted areas of the application
            </CardDescription>
          </CardHeader>
          <form onSubmit={createAdmin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/15 p-3 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Make sure to remember these credentials!
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Admin...
                  </>
                ) : (
                  "Create Admin User"
                )}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">Back to Login</Link>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PublicLayout>
  );
}
