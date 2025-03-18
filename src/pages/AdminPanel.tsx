
import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserTable } from "@/components/admin/UserTable";
import { AdminHeader } from "@/components/admin/AdminHeader";

// Interface that matches the actual database schema
interface ProfileData {
  id: string;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
  is_admin: boolean | null;
  is_affiliate: boolean | null;
}

// Define an extended type for use in components that expect user_id
type UserProfileWithUserId = ProfileData & { user_id: string };

const AdminPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log("AdminPanel - Component mounting");

  // Fetch all users with their profiles
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      console.log("AdminPanel - Fetching users data");
      
      try {
        // Get all users using the auth API
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error("AdminPanel - Error fetching users:", authError);
          throw authError;
        }
        
        if (!authData || !authData.users) {
          console.log("AdminPanel - No users returned from API");
          return [];
        }
        
        const userList = authData.users;
        console.log("AdminPanel - Users fetched:", userList.length);
        
        // Get all profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");
        
        if (profilesError) {
          console.error("AdminPanel - Error fetching profiles:", profilesError);
          throw profilesError;
        }
        
        console.log("AdminPanel - Profiles fetched:", profiles?.length || 0);
        
        // Join users with their profiles
        const usersWithProfiles = userList.map((user: User) => {
          // Find the profile that matches the user ID
          const profile = profiles?.find((p: ProfileData) => p.id === user.id);
          
          // If profile exists, add user_id property for component compatibility
          const formattedProfile = profile ? {
            ...profile,
            user_id: user.id
          } : undefined;
          
          return { 
            ...user, 
            profile: formattedProfile 
          };
        });
        
        console.log("AdminPanel - Users with profiles processed:", usersWithProfiles.length);
        return usersWithProfiles;
      } catch (err) {
        console.error("AdminPanel - Error in queryFn:", err);
        throw err;
      }
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Toggle affiliate status mutation
  const toggleAffiliateMutation = useMutation({
    mutationFn: async ({ userId, setAffiliate }: { userId: string; setAffiliate: boolean }) => {
      console.log("AdminPanel - Toggling affiliate status:", { userId, setAffiliate });
      
      const { error } = await supabase
        .from("profiles")
        .update({ is_affiliate: setAffiliate })
        .eq("id", userId);
      
      if (error) {
        console.error("AdminPanel - Error updating affiliate status:", error);
        throw error;
      }
      
      console.log("AdminPanel - Affiliate status updated successfully");
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
      console.error("AdminPanel - Mutation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update user: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    },
  });

  const handleToggleAffiliate = (userId: string, isCurrentlyAffiliate: boolean) => {
    console.log("AdminPanel - Handle toggle affiliate called:", { userId, isCurrentlyAffiliate });
    toggleAffiliateMutation.mutate({
      userId,
      setAffiliate: !isCurrentlyAffiliate,
    });
  };

  // Calculate stats
  const userCount = users?.length ?? 0;
  const affiliateCount = users?.filter(user => user.profile?.is_affiliate)?.length ?? 0;

  console.log("AdminPanel - Rendering with stats:", { userCount, affiliateCount });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-200px)] w-full flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <span className="text-xl font-medium">Loading admin panel data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">
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
