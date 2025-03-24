
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminPanelUser } from "@/components/admin/UserManagement";
import { useAuth } from "@/contexts/auth";
import { useEffect } from "react";

interface UseAdminUsersOptions {
  enabled?: boolean;
  staleTime?: number;
}

export function useAdminUsers(options: UseAdminUsersOptions = {}) {
  const { isAuthenticated, isAdmin, sessionChecked } = useAuth();
  const { enabled = true, staleTime = 10000 } = options; // Reduced stale time
  
  const queryResult = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      console.log("useAdminUsers - Fetching users data");
      
      try {
        // First, try to get profiles directly as this is more reliable
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");
        
        if (profilesError) {
          console.error("useAdminUsers - Error fetching profiles:", profilesError);
          throw profilesError;
        }
        
        console.log("useAdminUsers - Successfully fetched profiles:", profiles);
        
        // If we have profiles, try to get the auth users to enrich the data
        if (profiles && profiles.length > 0) {
          try {
            const { data: { users } = { users: [] }, error: authError } = await supabase.auth.admin.listUsers();
            
            if (authError) {
              console.error("useAdminUsers - Error fetching auth users:", authError);
              
              // Just use profile data if we can't get auth users
              return profiles.map((profile: any): AdminPanelUser => ({
                id: profile.id,
                email: "No Email Available", // We don't have emails from profiles only
                created_at: profile.created_at,
                profile: {
                  ...profile,
                  id: profile.id,
                  user_id: profile.id
                }
              }));
            }
            
            // Create a map of auth users by ID for easy lookup
            const usersMap = (users || []).reduce((acc: Record<string, any>, user: any) => {
              acc[user.id] = user;
              return acc;
            }, {});
            
            // Combine profile and auth user data
            return profiles.map((profile: any): AdminPanelUser => {
              const authUser = usersMap[profile.id];
              
              return {
                id: profile.id,
                email: authUser?.email || "No Email Available",
                created_at: authUser?.created_at || profile.created_at,
                profile: {
                  ...profile,
                  user_id: profile.id
                }
              };
            });
          } catch (error) {
            console.error("useAdminUsers - Error in auth users fetch:", error);
            
            // Fall back to just profiles
            return profiles.map((profile: any): AdminPanelUser => ({
              id: profile.id,
              email: "No Email Available",
              created_at: profile.created_at,
              profile: {
                ...profile,
                user_id: profile.id
              }
            }));
          }
        } else {
          // No profiles found, try to get users directly
          try {
            const { data: { users } = { users: [] }, error: authError } = await supabase.auth.admin.listUsers();
            
            if (authError) {
              console.error("useAdminUsers - Error fetching auth users:", authError);
              return [];
            }
            
            return (users || []).map((user: any): AdminPanelUser => ({
              id: user.id,
              email: user.email || "No Email Available",
              created_at: user.created_at || new Date().toISOString(),
              profile: {
                id: user.id,
                user_id: user.id,
                full_name: user.user_metadata?.full_name || null,
                created_at: user.created_at || new Date().toISOString(),
                updated_at: user.updated_at || new Date().toISOString(),
                is_admin: false
              }
            }));
          } catch (error) {
            console.error("useAdminUsers - Error in direct auth users fetch:", error);
            return [];
          }
        }
      } catch (error: any) {
        console.error("useAdminUsers - Critical error:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
    // Only fetch data if user is authenticated, admin, and session has been checked
    enabled: enabled && isAuthenticated && sessionChecked,
    staleTime: staleTime, // Reduced stale time to refresh more often
    gcTime: 60000 * 5,
  });
  
  // Setup a real-time subscription to profiles changes
  useEffect(() => {
    if (!isAuthenticated || !isAdmin || !sessionChecked) return;
    
    console.log("Setting up real-time subscription to profiles");
    
    const subscription = supabase
      .channel('admin-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log("Real-time profile change detected:", payload);
          // Invalidate and refetch the query when changes are detected
          queryResult.refetch();
        }
      )
      .subscribe();
    
    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(subscription);
    };
  }, [isAuthenticated, isAdmin, sessionChecked, queryResult.refetch]);
  
  return queryResult;
}
