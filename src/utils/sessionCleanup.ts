
/**
 * Utility functions for managing auth session cleanup
 */

// Track if we already have a cleanup in progress to avoid duplication
let cleanupInProgress = false;

/**
 * Clears all authentication data from local storage
 */
export const clearAllAuthData = () => {
  try {
    // Clear session-specific keys first
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('user_session');
    localStorage.removeItem('sessionLastUpdated');
    localStorage.removeItem('userSubscriptionPlan');
    
    // Try to clear any other auth-related keys (prefix-based approach)
    Object.keys(localStorage).forEach(key => {
      if (key.includes('auth') || key.includes('supabase') || key.includes('session')) {
        localStorage.removeItem(key);
      }
    });
    
    cleanupInProgress = false;
    console.log('All auth data has been cleared');
  } catch (e) {
    console.error('Error during auth data cleanup:', e);
    cleanupInProgress = false;
  }
};

/**
 * Debounced version of clearAllAuthData to prevent multiple simultaneous cleanups
 */
export const debouncedClearAllAuthData = () => {
  if (cleanupInProgress) return;
  
  cleanupInProgress = true;
  setTimeout(() => {
    clearAllAuthData();
  }, 100);
};
