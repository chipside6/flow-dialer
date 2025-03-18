
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserTable } from "@/components/admin/UserTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Interface for the simplified User type for our admin panel
export interface AdminPanelUser {
  id: string;
  email?: string | null;
  created_at?: string;
  profile?: UserProfile;
}

// Interface that matches the actual profile schema
export interface UserProfile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
  is_admin: boolean | null;
  is_affiliate: boolean | null;
  user_id: string; // This is added for component compatibility
}

interface UserManagementProps {
  users: AdminPanelUser[];
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
}

export function UserManagement({ users = [], isLoading, error, onRetry }: UserManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Toggle affiliate status mutation
  const toggleAffiliateMutation = useMutation({
    mutationFn: async ({ userId, setAffiliate }: { userId: string; setAffiliate: boolean }) => {
      console.log("UserManagement - Toggling affiliate status:", { userId, setAffiliate });
      
      const { error } = await supabase
        .from("profiles")
        .update({ is_affiliate: setAffiliate })
        .eq("id", userId);
      
      if (error) {
        console.error("UserManagement - Error updating affiliate status:", error);
        throw error;
      }
      
      console.log("UserManagement - Affiliate status updated successfully");
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "Success",
        description: "User affiliate status updated successfully",
      });
    },
    onError: (error) => {
      console.error("UserManagement - Mutation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update user: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    },
  });

  const handleToggleAffiliate = (userId: string, isCurrentlyAffiliate: boolean) => {
    console.log("UserManagement - Handle toggle affiliate called:", { userId, isCurrentlyAffiliate });
    toggleAffiliateMutation.mutate({
      userId,
      setAffiliate: !isCurrentlyAffiliate,
    });
  };

  if (error && onRetry) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">User Management</h2>
      <UserTable 
        users={users} 
        toggleAffiliate={handleToggleAffiliate}
        isLoading={isLoading || toggleAffiliateMutation.isPending}
      />
    </div>
  );
}
