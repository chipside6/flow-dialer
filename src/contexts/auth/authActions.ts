
import { supabase } from '@/integrations/supabase/client';

export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    
    return {
      success: !error,
      error: error ? new Error(error.message) : null
    };
  } catch (error: any) {
    return {
      success: false,
      error: new Error(error.message || 'Error signing out')
    };
  }
}
