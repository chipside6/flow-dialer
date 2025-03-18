
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminPanelUser, UserProfile } from "@/components/admin/UserManagement";

interface UseAdminUsersOptions {
  enabled?: boolean;
}

export function useAdminUsers(options: UseAdminUsersOptions = {}) {
  const { enabled = true } = options;
  
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      console.log("useAdminUsers - Fetching users data");
      
      try {
        // Get profiles first - this doesn't require admin privileges
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");
        
        if (profilesError) {
          console.error("useAdminUsers - Error fetching profiles:", profilesError);
          throw new Error(`Failed to fetch user profiles: ${profilesError.message}`);
        }
        
        console.log("useAdminUsers - Successfully fetched profiles count:", profiles?.length || 0);
        
        // When we only have profiles data (no auth data), map them to the expected format
        const mapProfilesOnly = () => {
          if (!profiles || profiles.length === 0) {
            console.log("useAdminUsers - No profiles found, returning empty array");
            return [];
          }
          
          console.log("useAdminUsers - Mapping profiles without auth data");
          return profiles.map((profile: any): AdminPanelUser => ({
            id: profile.id,
            email: "Unknown", // We don't have emails without auth data
            created_at: profile.created_at || new Date().toISOString(),
            profile: {
              ...profile,
              user_id: profile.id
            }
          }));
        };
        
        try {
          console.log("useAdminUsers - Attempting to access admin API");
          // Attempt to use admin API (will fail for non-admin users)
          const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
          
          if (authError) {
            console.log("useAdminUsers - Cannot access admin API, using profiles only:", authError.message);
            return mapProfilesOnly();
          }
          
          if (!authData || !authData.users || authData.users.length === 0) {
            console.log("useAdminUsers - No users returned from admin API, using profiles only");
            return mapProfilesOnly();
          }
          
          console.log("useAdminUsers - Admin API access successful, joining with profiles");
          
          // Join users with their profiles
          const usersWithProfiles = authData.users.map((user: any): AdminPanelUser => {
            // Find the profile that matches the user ID
            const profile = profiles?.find((p: any) => p.id === user.id);
            
            // If profile exists, add user_id property for component compatibility
            const formattedProfile = profile ? {
              ...profile,
              user_id: user.id
            } : undefined;
            
            return { 
              id: user.id, 
              email: user.email || "No Email",
              created_at: user.created_at || new Date().toISOString(),
              profile: formattedProfile 
            };
          });
          
          console.log("useAdminUsers - Successfully processed users with profiles:", usersWithProfiles.length);
          return usersWithProfiles;
        } catch (error) {
          console.log("useAdminUsers - Error accessing admin API, using profiles only:", error);
          // Make sure to return the mapped profiles here
          return mapProfilesOnly();
        }
      } catch (error) {
        console.error("useAdminUsers - Critical error:", error);
        // Return empty array instead of throwing to avoid loading state getting stuck
        return [];
      }
    },
    refetchOnWindowFocus: false,
    retry: 1, // Reduced retry count to fail faster in case of real errors
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    enabled,
  });
}
