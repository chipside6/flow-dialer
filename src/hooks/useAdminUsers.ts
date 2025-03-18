
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminPanelUser } from "@/components/admin/UserManagement";

interface UseAdminUsersOptions {
  enabled?: boolean;
  staleTime?: number;
}

export function useAdminUsers(options: UseAdminUsersOptions = {}) {
  const { enabled = true, staleTime = 5000 } = options;
  
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
          // Return empty array instead of throwing to prevent loading state
          return [];
        }
        
        console.log("useAdminUsers - Successfully fetched profiles count:", profiles?.length || 0);
        
        // Map profiles to expected format function
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
        
        // Try to fetch auth data, but fall back to using profiles only if not an admin
        try {
          // Attempt to get auth data (will fail for non-admin users)
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
            const profile = profiles?.find((p: any) => p.id === user.id);
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
        } catch (error: any) {
          console.log("useAdminUsers - Error accessing admin API, using profiles only:", error);
          // Return only profile data if we can't access admin data
          return mapProfilesOnly();
        }
      } catch (error: any) {
        console.error("useAdminUsers - Critical error:", error);
        // Return an empty array instead of throwing an error
        return [];
      }
    },
    refetchOnWindowFocus: false,
    retry: 1, // Reduce retries
    retryDelay: 500, // Shorter retry delay
    enabled,
    staleTime,
    gcTime: 60000 * 5, // Keep data in cache for 5 minutes
  });
}
