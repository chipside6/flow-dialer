
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  created_at: string;
  updated_at: string;
  is_admin: boolean | null;
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
        isLoading={isLoading}
      />
    </div>
  );
}
