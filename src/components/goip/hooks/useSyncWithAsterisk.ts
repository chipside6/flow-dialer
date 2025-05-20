
import { supabase } from '@/integrations/supabase/client';

export const useSyncWithAsterisk = () => {
  /**
   * Sync SIP trunk configuration with Asterisk via Supabase Edge Function.
   */
  const syncWithAsterisk = async (userId: string) => {
    const { data: session } = await supabase.auth.getSession();
    const accessToken = session.session?.access_token;
    
    if (accessToken) {
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-goip-config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            userId,
            operation: 'sync_user'
          })
        });
      } catch (syncError) {
        console.error('Error syncing with Asterisk:', syncError);
      }
    }
  };

  return { syncWithAsterisk };
};
