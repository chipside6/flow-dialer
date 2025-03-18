
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
      
      // Get profiles first since this doesn't require admin privileges
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
      
      if (profilesError) {
        console.error("useAdminUsers - Error fetching profiles:", profilesError);
        throw new Error(`Failed to fetch user profiles: ${profilesError.message}`);
      }
      
      console.log("useAdminUsers - Profiles fetched:", profiles?.length || 0);
      
      // Try to get users via the admin API
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error("useAdminUsers - Error fetching users via admin API:", authError);
          throw new Error(`Admin API error: ${authError.message}`);
        }
        
        if (!authData || !authData.users) {
          console.log("useAdminUsers - No users returned from admin API");
          // Fallback to using just profiles if admin API returns empty
          return profiles.map((profile: any): AdminPanelUser => ({
            id: profile.id,
            email: "Unknown",
            created_at: profile.created_at,
            profile: {
              ...profile,
              user_id: profile.id
            }
          }));
        }
        
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
            email: user.email,
            created_at: user.created_at,
            profile: formattedProfile 
          };
        });
        
        console.log("useAdminUsers - Users with profiles processed:", usersWithProfiles.length);
        return usersWithProfiles;
      } catch (adminError) {
        console.error("useAdminUsers - Admin API failed, using profiles only:", adminError);
        
        // Fallback to using just profiles if admin API fails
        return profiles.map((profile: any): AdminPanelUser => ({
          id: profile.id,
          email: "Unknown",
          created_at: profile.created_at,
          profile: {
            ...profile,
            user_id: profile.id
          }
        }));
      }
    },
    refetchOnWindowFocus: false,
    retry: 1,
    enabled,
  });
}
