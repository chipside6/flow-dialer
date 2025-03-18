
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { UserManagement, AdminPanelUser, UserProfile } from "@/components/admin/UserManagement";

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

export function UsersDataFetcher() {
  console.log("UsersDataFetcher - Component mounting");

  // Fetch all users with their profiles
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      console.log("UsersDataFetcher - Fetching users data");
      
      try {
        // Get profiles first since this doesn't require admin privileges
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");
        
        if (profilesError) {
          console.error("UsersDataFetcher - Error fetching profiles:", profilesError);
          throw profilesError;
        }
        
        console.log("UsersDataFetcher - Profiles fetched:", profiles?.length || 0);
        
        // Try to get users via the admin API
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
          
          if (authError) {
            console.error("UsersDataFetcher - Error fetching users via admin API:", authError);
            throw authError;
          }
          
          if (!authData || !authData.users) {
            console.log("UsersDataFetcher - No users returned from admin API");
            // Fallback to using just profiles if admin API fails
            return profiles.map((profile: ProfileData): AdminPanelUser => ({
              id: profile.id,
              email: "Unknown",
              created_at: profile.created_at,
              profile: {
                ...profile,
                user_id: profile.id
              }
            }));
          }
          
          const userList = authData.users;
          console.log("UsersDataFetcher - Users fetched from admin API:", userList.length);
          
          // Join users with their profiles
          const usersWithProfiles = userList.map((user: User): AdminPanelUser => {
            // Find the profile that matches the user ID
            const profile = profiles?.find((p: ProfileData) => p.id === user.id);
            
            // If profile exists, add user_id property for component compatibility
            const formattedProfile = profile ? {
              ...profile,
              user_id: user.id
            } : undefined;
            
            return { 
              id: user.id, 
              email: user.email,
              created_at: user.created_at,
              profile: formattedProfile 
            };
          });
          
          console.log("UsersDataFetcher - Users with profiles processed:", usersWithProfiles.length);
          return usersWithProfiles;
        } catch (adminError) {
          console.error("UsersDataFetcher - Admin API failed, using profiles only:", adminError);
          // Fallback to using just profiles if admin API fails
          return profiles.map((profile: ProfileData): AdminPanelUser => ({
            id: profile.id,
            email: "Unknown",
            created_at: profile.created_at,
            profile: {
              ...profile,
              user_id: profile.id
            }
          }));
        }
      } catch (err) {
        console.error("UsersDataFetcher - Error in queryFn:", err);
        throw err;
      }
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Calculate stats
  const userCount = users?.length ?? 0;
  const affiliateCount = users?.filter(user => user.profile?.is_affiliate)?.length ?? 0;

  console.log("UsersDataFetcher - Rendering with stats:", { userCount, affiliateCount });

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

        <AdminHeader userCount={userCount} affiliateCount={affiliateCount} />
        
        <UserManagement 
          users={users} 
          isLoading={isLoading} 
          error={error instanceof Error ? error : null} 
        />
      </div>
    </DashboardLayout>
  );
}
