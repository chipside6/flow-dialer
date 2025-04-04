
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
    localStorage.removeItem('userSubscriptionPlan');
    localStorage.removeItem('userSubscription');
    localStorage.removeItem('subscriptionLastUpdated');
    localStorage.removeItem('sessionLastUpdated');
    
    // Clear any other auth-related storage items
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('auth') || key.includes('token') || key.includes('user') || 
      key.includes('session') || key.includes('supabase') || key.includes('subscription')
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
    
    // Clear additional local storage items related to user data
    ['callCount', 'dialect', 'lastUpdate', 'callLimit'].forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove key ${key}:`, e);
      }
    });
    
    // Clear all API cache entries
    try {
      const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
      cacheKeys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (e) {
      console.warn('Error clearing API cache:', e);
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

// Improved debounced version of clearAllAuthData
export const debouncedClearAllAuthData = (() => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let queued = false;
  
  return () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    // Prevent duplicate calls in the same tick
    if (!queued) {
      queued = true;
      
      // Use microtask to ensure it runs in this event loop
      queueMicrotask(() => {
        timeout = setTimeout(() => {
          clearAllAuthData();
          timeout = null;
          queued = false;
        }, 100);
      });
    }
  };
})();

/**
 * Forces the application to reload after clearing auth data
 */
export const forceAppReload = () => {
  clearAllAuthData();
  setTimeout(() => {
    window.location.reload();
  }, 150); // Slightly longer delay to ensure cleanup completes
};

/**
 * Perform a complete session reset by clearing all auth data and reloading the page
 */
export const resetAppSession = () => {
  try {
    console.log('Performing complete app session reset');
    
    // Try to clear all browsing data we can access
    clearAllAuthData();
    
    // Clear supabase-specific auth state
    try {
      // Import supabase dynamically to avoid window reference
      import('@/integrations/supabase/client').then(({ supabase }) => {
        supabase.auth.signOut().catch(e => 
          console.warn('Error during Supabase sign out:', e)
        );
      }).catch(err => {
        console.warn('Error importing Supabase client:', err);
      });
    } catch (e) {
      console.warn('Error accessing Supabase client:', e);
    }
    
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

// Add a new utility to check for stale authentication data
export const isAuthDataStale = (): boolean => {
  try {
    const lastUpdated = localStorage.getItem('sessionLastUpdated');
    if (!lastUpdated) return true;
    
    const lastUpdatedTime = parseInt(lastUpdated, 10);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    
    return now - lastUpdatedTime > oneHour;
  } catch (e) {
    console.warn('Error checking auth data staleness:', e);
    return true;
  }
};

// Safe way to refresh authentication without disrupting user experience
export const refreshAuthDataIfStale = async (): Promise<boolean> => {
  if (!isAuthDataStale()) return false;
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('Error refreshing auth session:', error);
      return false;
    }
    
    if (data?.session) {
      localStorage.setItem('sessionLastUpdated', Date.now().toString());
      return true;
    }
    
    return false;
  } catch (e) {
    console.error('Error refreshing auth data:', e);
    return false;
  }
};

// Function to check if a user is anonymous or temporary user
export const isTemporaryOrAnonymousUser = (): boolean => {
  try {
    // Check for recently created anonymous sessions
    const { supabase } = require('@/integrations/supabase/client');
    const session = supabase.auth.session();
    
    if (!session) return true;
    
    // Check for missing user attributes that would indicate a proper account
    if (!session.user?.email) return true;
    
    return false;
  } catch (e) {
    console.error('Error checking anonymous user status:', e);
    return false;
  }
};
