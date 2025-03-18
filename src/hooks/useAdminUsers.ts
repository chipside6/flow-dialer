
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
        // Get profiles directly from the profiles table
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("*");
        
        if (error) {
          console.error("useAdminUsers - Error fetching profiles:", error);
          throw error;
        }
        
        console.log("useAdminUsers - Successfully fetched profiles:", profiles);
        
        // If we have profiles, format them as AdminPanelUser objects
        if (profiles && profiles.length > 0) {
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
        
        // Make sure we return an empty array instead of undefined
        console.log("useAdminUsers - No profiles found, returning empty array");
        return [];
      } catch (error: any) {
        console.error("useAdminUsers - Critical error:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
    enabled,
    staleTime: 1000, // Reduced stale time to refresh more frequently
    gcTime: 60000 * 5,
  });
}
