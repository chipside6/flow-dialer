
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminPanelUser } from "@/components/admin/UserManagement";
import { useAuth } from "@/contexts/auth";

interface UseAdminUsersOptions {
  enabled?: boolean;
  staleTime?: number;
}

export function useAdminUsers(options: UseAdminUsersOptions = {}) {
  const { isAuthenticated, isAdmin, sessionChecked } = useAuth();
  const { enabled = true, staleTime = 60000 } = options;
  
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      console.log("useAdminUsers - Fetching users data");
      
      try {
        // First approach: Get auth users and join with profiles
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error("useAdminUsers - Error fetching auth users:", authError);
          // Fall back to just profiles if we can't get auth users
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("*");
          
          if (profilesError) {
            console.error("useAdminUsers - Error fetching profiles:", profilesError);
            throw profilesError;
          }
          
          console.log("useAdminUsers - Successfully fetched profiles as fallback:", profiles);
          
          return profiles.map((profile: any): AdminPanelUser => ({
            id: profile.id,
            email: profile.email || "No Email Available", 
            created_at: profile.created_at || new Date().toISOString(),
            profile: {
              ...profile,
              user_id: profile.id
            }
          }));
        }
        
        console.log("useAdminUsers - Successfully fetched auth users:", users);
        
        // Get all profiles to match with users
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");
        
        if (profilesError) {
          console.error("useAdminUsers - Error fetching profiles for join:", profilesError);
        }
        
        // Create a map of profiles by ID for easy lookup
        const profilesMap = (profiles || []).reduce((acc: Record<string, any>, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
        
        // Map users to our expected format
        return users.map((user): AdminPanelUser => {
          const userProfile = profilesMap[user.id] || {};
          
          return {
            id: user.id,
            email: user.email || userProfile.email || "No Email Available",
            created_at: user.created_at || new Date().toISOString(),
            profile: {
              ...userProfile,
              id: user.id,
              user_id: user.id,
              is_admin: userProfile.is_admin ?? false
            }
          };
        });
      } catch (error: any) {
        console.error("useAdminUsers - Critical error:", error);
        
        // Last resort: Try to get just profiles directly
        try {
          const { data: profiles, error: fallbackError } = await supabase
            .from("profiles")
            .select("*");
          
          if (fallbackError) throw fallbackError;
          
          console.log("useAdminUsers - Using fallback profiles data:", profiles);
          return (profiles || []).map((profile: any): AdminPanelUser => ({
            id: profile.id,
            email: profile.email || "No Email Available",
            created_at: profile.created_at || new Date().toISOString(),
            profile: {
              ...profile,
              user_id: profile.id
            }
          }));
        } catch (fallbackError) {
          console.error("useAdminUsers - Fallback also failed:", fallbackError);
          throw error; // Throw the original error
        }
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
    // Only fetch data if user is authenticated, admin, and session has been checked
    enabled: enabled && isAuthenticated && isAdmin && sessionChecked,
    staleTime: staleTime, // Cache the data for 1 minute to reduce unnecessary requests
    gcTime: 60000 * 5,
  });
}
