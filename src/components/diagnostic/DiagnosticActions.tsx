
import React, { useState } from 'react';
import { DatabaseIcon, UserIcon, RefreshCw } from "lucide-react";
import { DiagnosticCard } from "./DiagnosticCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { logSupabaseOperation, OperationType } from "@/utils/supabaseDebug";
import { toast } from "@/components/ui/use-toast";

export const DiagnosticActions: React.FC = () => {
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
    <div className="grid gap-6 md:grid-cols-3">
      <DiagnosticCard
        title="Database Connection"
        icon={DatabaseIcon}
        onClick={testDatabaseConnection}
        isLoading={isLoading.database}
        loadingText="Testing..."
        actionText="Test Connection"
      />
      
      <DiagnosticCard
        title="Authentication Status"
        icon={UserIcon}
        onClick={testAuthConnection}
        isLoading={isLoading.auth}
        loadingText="Checking..."
        actionText="Check Auth Status"
      />
      
      <DiagnosticCard
        title="Reset Session"
        icon={RefreshCw}
        onClick={handleSignOut}
        isLoading={isLoading.signOut}
        loadingText="Signing Out..."
        actionText="Sign Out and Reset"
      />
    </div>
  );
};
