/**
 * Comprehensive session and token cleanup utilities with performance optimizations
 * Used to ensure complete logout and prevent automatic sign-in
 */

// Create a Set to keep track of already removed items to prevent duplicate operations
const removedItems = new Set<string>();

// Debounce function to limit frequent cleanup calls
const debounce = <F extends (...args: any[]) => any>(func: F, wait: number): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Optimized function to clear all authentication-related data from browser storage
 */
export const clearAllAuthData = (): void => {
  console.log("Performing optimized session cleanup");
  
  try {
    // Use a more efficient approach to clear localStorage items
    const localStorageKeys = Object.keys(localStorage);
    const authRelatedKeys = localStorageKeys.filter(key => 
      key.includes('supabase') || 
      key.includes('auth') || 
      key.includes('session') || 
      key.includes('token') || 
      key.includes('user')
    );
    
    // Process keys in batches for better performance
    const batchSize = 5;
    for (let i = 0; i < authRelatedKeys.length; i += batchSize) {
      const batch = authRelatedKeys.slice(i, i + batchSize);
      
      // Use setTimeout to prevent UI blocking during large cleanups
      setTimeout(() => {
        batch.forEach(key => {
          if (!removedItems.has(key)) {
            console.log(`Removing localStorage item: ${key}`);
            localStorage.removeItem(key);
            removedItems.add(key);
          }
        });
      }, 0);
    }
    
    // Clear sessionStorage items with the same batching approach
    const sessionStorageKeys = Object.keys(sessionStorage);
    const authRelatedSessionKeys = sessionStorageKeys.filter(key => 
      key.includes('supabase') || 
      key.includes('auth') || 
      key.includes('session') || 
      key.includes('token') || 
      key.includes('user')
    );
    
    for (let i = 0; i < authRelatedSessionKeys.length; i += batchSize) {
      const batch = authRelatedSessionKeys.slice(i, i + batchSize);
      
      setTimeout(() => {
        batch.forEach(key => {
          if (!removedItems.has(`session_${key}`)) {
            console.log(`Removing sessionStorage item: ${key}`);
            sessionStorage.removeItem(key);
            removedItems.add(`session_${key}`);
          }
        });
      }, 0);
    }
    
    // Optimize cookie clearing by processing in one go
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name && (
          name.includes('supabase') || 
          name.includes('auth') || 
          name.includes('sb-') || 
          name.includes('token') || 
          name.includes('session')
      )) {
        if (!removedItems.has(`cookie_${name}`)) {
          console.log(`Removing cookie: ${name}`);
          // Expire the cookie with all possible path/domain combinations
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
          removedItems.add(`cookie_${name}`);
        }
      }
    });
    
    // As a last resort, clear specific Supabase-related items
    const criticalKeys = [
      'supabase.auth.token',
      'sb-refresh-token',
      'sb-access-token',
      'user_session'
    ];
    
    criticalKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.log("Optimized session cleanup completed");
    
    // Clear the tracking set after a delay to save memory
    setTimeout(() => {
      removedItems.clear();
    }, 5000);
    
  } catch (error) {
    console.error("Error during aggressive session cleanup:", error);
  }
};

/**
 * Debounced version of clearAllAuthData to prevent excessive calls
 */
export const debouncedClearAllAuthData = debounce(clearAllAuthData, 300);

/**
 * Force reload the application to ensure a clean slate with optimized caching
 */
export const forceAppReload = (): void => {
  console.log("Forcing optimized application reload");
  
  // Add cache-busting parameter with more entropy for better cache invalidation
  const cacheBuster = `?cache=${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  
  // Clear navigation cache before reload
  if ('caches' in window) {
    // Try to clear navigation caches when available
    try {
      caches.delete('navigation-cache').catch(() => {});
    } catch (e) {
      console.warn("Could not clear navigation cache:", e);
    }
  }
  
  // Replace current URL with cache-busting parameter and force reload
  window.location.href = `${window.location.pathname}${cacheBuster}`;
};
