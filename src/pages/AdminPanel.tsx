
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserTable } from "@/components/admin/UserTable";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface UserProfile {
  id: string;
  user_id: string;
  created_at: string;
  is_admin: boolean;
  is_affiliate: boolean;
}

const AdminPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users with their profiles
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      // Get all users
      const { data: users, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
      
      if (profilesError) throw profilesError;
      
      // Join users with their profiles
      const usersWithProfiles = users.users.map((user: User) => {
        const profile = profiles.find((p: UserProfile) => p.user_id === user.id);
        return { ...user, profile };
      });
      
      return usersWithProfiles;
    },
  });

  // Toggle affiliate status mutation
  const toggleAffiliateMutation = useMutation({
    mutationFn: async ({ userId, setAffiliate }: { userId: string; setAffiliate: boolean }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_affiliate: setAffiliate })
        .eq("user_id", userId);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "Success",
        description: "User affiliate status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update user: ${error.message}`,
      });
    },
  });

  const handleToggleAffiliate = (userId: string, isCurrentlyAffiliate: boolean) => {
    toggleAffiliateMutation.mutate({
      userId,
      setAffiliate: !isCurrentlyAffiliate,
    });
  };

  // Calculate stats
  const userCount = users?.length ?? 0;
  const affiliateCount = users?.filter(user => user.profile?.is_affiliate)?.length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage users and configure system settings
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </AlertDescription>
          </Alert>
        )}

        <AdminHeader userCount={userCount} affiliateCount={affiliateCount} />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">User Management</h2>
          <UserTable 
            users={users || []} 
            toggleAffiliate={handleToggleAffiliate}
            isLoading={isLoading || toggleAffiliateMutation.isPending}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
