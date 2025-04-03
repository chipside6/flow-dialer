
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * Force reload the application and clear any cached state
 */
export const forceAppReload = () => {
  // Clear any local cache
  try {
    localStorage.removeItem('sessionLastUpdated');
    
    // Only log the user out if we're actually reloading due to auth issues
    supabase.auth.signOut().catch((err) => {
      console.error("Error signing out:", err);
    });
    
    // Use a timeout to ensure the logout completes
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  } catch (err) {
    console.error("Error during app reload:", err);
    // Fallback if localStorage manipulation fails
    window.location.reload();
  }
};

/**
 * Handles critical session errors that require a full reset
 */
export const handleCriticalSessionError = (error: Error) => {
  console.error("Critical session error:", error);
  
  toast({
    title: "Session Error",
    description: "Your session is invalid. Please sign in again.",
    variant: "destructive",
  });
  
  // Force app reload after a short delay to show the toast
  setTimeout(() => forceAppReload(), 2000);
};
