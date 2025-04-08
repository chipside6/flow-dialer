
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { UserProfile } from "@/components/admin/UserManagement";

export interface AdminPanelUser {
  id: string;
  email: string | null;
  created_at: string;
  profile?: UserProfile;
}

/**
 * Optimized hook for fetching admin users data with batched requests and connection pooling
 */
export const useAdminUsers = (options = {}) => {
  const { user, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      if (!user || !isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      console.log("Fetching admin users data");
      
      // Use Promise.all to execute queries in parallel for better performance
      const [usersResult, profilesResult] = await Promise.all([
        // Fetch users from auth.users using the admin API
        supabase.auth.admin.listUsers(),
        
        // Fetch all profiles in a single query
        supabase.from('profiles').select('*')
      ]);

      if (usersResult.error) {
        console.error("Error fetching users:", usersResult.error);
        throw usersResult.error;
      }

      if (profilesResult.error) {
        console.error("Error fetching profiles:", profilesResult.error);
        // Continue with users even if profiles fail
      }

      // Create a map of profiles by user ID for efficient lookup
      const profilesMap = new Map();
      if (profilesResult.data) {
        profilesResult.data.forEach(profile => {
          profilesMap.set(profile.id, {
            id: profile.id,
            full_name: profile.full_name || null,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            is_admin: profile.is_admin || false,
            user_id: profile.id // Use id as user_id for compatibility
          });
        });
      }

      // Map users with their profiles
      const users = (usersResult.data?.users || []).map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        profile: profilesMap.get(user.id) || null
      }));

      console.log(`Successfully fetched ${users.length} users with profiles`);
      return users;
    },
    enabled: !!user && isAdmin,
    ...options
  });
};
