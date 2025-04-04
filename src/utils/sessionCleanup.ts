
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
    
    // Clear session storage items too
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('auth') || key.includes('supabase') || key.includes('session')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Error clearing sessionStorage:', e);
    }
    
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

/**
 * Force the application to reload, clearing any state
 */
export const forceAppReload = () => {
  // First clear any cached auth data to prevent auto-login loops
  clearAllAuthData();
  
  // Force page reload
  try {
    window.location.href = '/login';
    
    // If the redirect doesn't work for some reason, try a hard reload
    setTimeout(() => {
      window.location.reload();
    }, 100);
  } catch (e) {
    console.error('Error during app reload:', e);
    // Fallback to basic reload
    window.location.reload();
  }
};
