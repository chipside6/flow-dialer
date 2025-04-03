
/**
 * Clears all authentication related data
 */
export const clearAllAuthData = () => {
  try {
    // Remove auth data from localStorage
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('user_session');
    localStorage.removeItem('isUserAdmin');
    localStorage.removeItem('adminLastUpdated');
    
    // Clear any other auth-related storage items
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('auth') || key.includes('token') || key.includes('user') || 
      key.includes('session') || key.includes('supabase')
    );
    
    authKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove key ${key}:`, e);
      }
    });
    
    // Also clear sessionStorage
    try {
      // Clear auth-related items from sessionStorage
      const sessionAuthKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('auth') || key.includes('token') || key.includes('user') || 
        key.includes('session') || key.includes('supabase')
      );
      
      sessionAuthKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
    } catch (e) {
      console.warn('Error clearing sessionStorage:', e);
    }
    
    // Clear auth-related cookies
    try {
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name && (
          name.includes('auth') || name.includes('token') || 
          name.includes('user') || name.includes('session') || 
          name.includes('supabase')
        )) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
    } catch (e) {
      console.warn('Error clearing cookies:', e);
    }
    
    console.log('Successfully cleared all auth data');
  } catch (error) {
    console.error('Error clearing auth data:', error);
    // Last resort - try to clear everything
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage as last resort:', e);
    }
  }
};

/**
 * Debounced version of clearAllAuthData to prevent multiple consecutive calls
 */
export const debouncedClearAllAuthData = (() => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      clearAllAuthData();
      timeout = null;
    }, 100);
  };
})();

/**
 * Forces the application to reload after clearing auth data
 */
export const forceAppReload = () => {
  clearAllAuthData();
  setTimeout(() => {
    window.location.reload();
  }, 100);
};

/**
 * Perform a complete session reset by clearing all auth data and reloading the page
 */
export const resetAppSession = () => {
  try {
    console.log('Performing complete app session reset');
    
    // Try to clear all browsing data we can access
    clearAllAuthData();
    
    // Wait a moment to ensure clearing finishes
    setTimeout(() => {
      // Navigate to login with clean state
      window.location.href = '/login?reset=1';
    }, 200);
  } catch (error) {
    console.error('Error during app reset:', error);
    // Last resort - just reload
    window.location.reload();
  }
};
