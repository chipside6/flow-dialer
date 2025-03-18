
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
        // First attempt: Get profiles from the profiles table
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");
        
        if (profilesError) {
          console.error("useAdminUsers - Error fetching profiles:", profilesError);
          throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
        }
        
        console.log("useAdminUsers - Successfully fetched profiles count:", profiles?.length || 0);
        
        // If we have profiles, format them as AdminPanelUser objects
        if (profiles && profiles.length > 0) {
          console.log("useAdminUsers - Formatting profiles as users");
          
          return profiles.map((profile: any): AdminPanelUser => ({
            id: profile.id,
            email: profile.email || "Restricted", // We don't have access to email without admin API
            created_at: profile.created_at || new Date().toISOString(),
            profile: {
              ...profile,
              user_id: profile.id
            }
          }));
        }
        
        // Make sure we return an empty array instead of undefined
        console.log("useAdminUsers - No profiles found, returning empty array");
        return [];
        
      } catch (error: any) {
        console.error("useAdminUsers - Critical error:", error);
        throw error; // Throw the error so React Query can handle it properly
      }
    },
    refetchOnWindowFocus: false,
    retry: 2, // Increased retry attempts
    retryDelay: 1000, // Increased retry delay
    enabled,
    staleTime,
    gcTime: 60000 * 5, // Keep data in cache for 5 minutes
  });
}
