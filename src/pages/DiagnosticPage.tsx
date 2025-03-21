
import React, { useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SupabaseStatus } from "@/components/diagnostic/SupabaseStatus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DatabaseIcon, UserIcon, FileIcon, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { logSupabaseOperation, OperationType } from "@/utils/supabaseDebug";
import { toast } from "@/components/ui/use-toast";

const DiagnosticPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({
    database: false,
    auth: false,
    signOut: false
  });
  
  const testDatabaseConnection = async () => {
    try {
      setIsLoading(prev => ({ ...prev, database: true }));
      // Test with a simple query
      const startTime = Date.now();
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      const endTime = Date.now();
      
      if (error) {
        logSupabaseOperation({
          operation: OperationType.READ,
          table: "profiles",
          user_id: user?.id || null,
          auth_status: isAuthenticated ? "AUTHENTICATED" : "UNAUTHENTICATED",
          success: false,
          error
        });
        
        toast({
          title: "Database Connection Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      logSupabaseOperation({
        operation: OperationType.READ,
        table: "profiles",
        user_id: user?.id || null,
        auth_status: isAuthenticated ? "AUTHENTICATED" : "UNAUTHENTICATED",
        success: true,
        data: {
          responseTime: `${endTime - startTime}ms`,
          result: data
        }
      });
      
      toast({
        title: "Database Connection Successful",
        description: `Response time: ${endTime - startTime}ms`,
      });
    } catch (err: any) {
      console.error("Error testing database connection:", err);
      toast({
        title: "Error Testing Connection",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, database: false }));
    }
  };
  
  const testAuthConnection = async () => {
    try {
      setIsLoading(prev => ({ ...prev, auth: true }));
      const startTime = Date.now();
      const { data, error } = await supabase.auth.getSession();
      const endTime = Date.now();
      
      logSupabaseOperation({
        operation: OperationType.AUTH,
        user_id: user?.id || null,
        auth_status: data.session ? "AUTHENTICATED" : "UNAUTHENTICATED",
        success: !error,
        error: error || null,
        data: {
          responseTime: `${endTime - startTime}ms`,
          hasSession: !!data.session
        }
      });
      
      if (error) {
        toast({
          title: "Auth Check Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: `Auth Status: ${data.session ? "Active Session" : "No Session"}`,
        description: `Response time: ${endTime - startTime}ms`,
      });
    } catch (err: any) {
      console.error("Error testing auth connection:", err);
      toast({
        title: "Error Testing Auth",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, auth: false }));
    }
  };
  
  const handleSignOut = async () => {
    try {
      setIsLoading(prev => ({ ...prev, signOut: true }));
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully"
      });
    } catch (err: any) {
      console.error("Error signing out:", err);
      toast({
        title: "Error Signing Out",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, signOut: false }));
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Supabase Diagnostic</h1>
            <p className="text-muted-foreground mt-1">
              Troubleshoot data persistence and connection issues
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Database Connection
              </CardTitle>
              <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testDatabaseConnection} 
                className="w-full"
                variant="outline"
                disabled={isLoading.database}
              >
                {isLoading.database ? "Testing..." : "Test Connection"}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Authentication Status
              </CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testAuthConnection} 
                className="w-full"
                variant="outline"
                disabled={isLoading.auth}
              >
                {isLoading.auth ? "Checking..." : "Check Auth Status"}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reset Session
              </CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSignOut} 
                className="w-full"
                variant="outline"
                disabled={isLoading.signOut}
              >
                {isLoading.signOut ? "Signing Out..." : "Sign Out and Reset"}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <SupabaseStatus />
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Connection Information</CardTitle>
              <CardDescription>
                Details about your Supabase connection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Project URL</h3>
                  <p className="font-mono text-sm text-muted-foreground break-all">
                    {import.meta.env.VITE_SUPABASE_URL || 'https://grhvoclalziyjbjlhpml.supabase.co'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Auth Configuration</h3>
                  <p className="font-mono text-sm text-muted-foreground">
                    Storage: {typeof localStorage !== 'undefined' ? 'localStorage' : 'unavailable'}
                  </p>
                  <p className="font-mono text-sm text-muted-foreground">
                    Persist Session: true
                  </p>
                  <p className="font-mono text-sm text-muted-foreground">
                    Auto Refresh Token: true
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">User Info</h3>
                  {isAuthenticated && user ? (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">User ID:</p>
                        <p className="font-mono break-all text-muted-foreground">{user.id}</p>
                      </div>
                      <div>
                        <p className="font-medium">Email:</p>
                        <p className="font-mono break-all text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not authenticated</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DiagnosticPage;
