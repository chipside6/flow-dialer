
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
    if (cleanupInProgress) {
      console.log('Session cleanup already in progress, skipping');
      return;
    }
    
    cleanupInProgress = true;
    
    // Aggressively clear all storage without checking keys first
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Error clearing storage:', e);
    }
    
    // Clear all cookies as fallback
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    cleanupInProgress = false;
    console.log('Auth data has been cleared');
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
  } catch (e) {
    console.error('Error during app reload:', e);
    // Fallback to basic reload
    window.location.reload();
  }
};
