
/**
 * Optimized session and token cleanup utilities with performance improvements
 */

// Use WeakMap for removed items to avoid memory leaks
const removedItems = new WeakMap<Window, Set<string>>();

// Get or create a set for the current window
const getOrCreateRemovedItemsSet = (): Set<string> => {
  if (!removedItems.has(window)) {
    removedItems.set(window, new Set());
  }
  return removedItems.get(window)!;
};

// Throttle function to limit frequent cleanup calls
const throttle = <F extends (...args: any[]) => any>(func: F, limit: number): ((...args: Parameters<F>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<F>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Optimized function to clear all authentication-related data from browser storage
 */
export const clearAllAuthData = (): void => {
  console.log("Performing highly optimized session cleanup");
  
  try {
    const removedItemsSet = getOrCreateRemovedItemsSet();
    
    // Process different storage types in parallel
    Promise.all([
      // Clear localStorage with batch processing
      (async () => {
        const localStorageKeys = Object.keys(localStorage).filter(key => 
          key.includes('supabase') || 
          key.includes('auth') || 
          key.includes('session') || 
          key.includes('token') || 
          key.includes('user')
        );
        
        // Process in chunks to prevent UI blocking
        const batchSize = 5;
        for (let i = 0; i < localStorageKeys.length; i += batchSize) {
          const batch = localStorageKeys.slice(i, i + batchSize);
          
          // Use microtask to yield to the event loop
          await new Promise<void>(resolve => {
            setTimeout(() => {
              batch.forEach(key => {
                if (!removedItemsSet.has(key)) {
                  localStorage.removeItem(key);
                  removedItemsSet.add(key);
                }
              });
              resolve();
            }, 0);
          });
        }
      })(),
      
      // Clear sessionStorage with similar approach
      (async () => {
        const sessionStorageKeys = Object.keys(sessionStorage).filter(key => 
          key.includes('supabase') || 
          key.includes('auth') || 
          key.includes('session') || 
          key.includes('token') || 
          key.includes('user')
        );
        
        const batchSize = 5;
        for (let i = 0; i < sessionStorageKeys.length; i += batchSize) {
          const batch = sessionStorageKeys.slice(i, i + batchSize);
          
          await new Promise<void>(resolve => {
            setTimeout(() => {
              batch.forEach(key => {
                if (!removedItemsSet.has(`session_${key}`)) {
                  sessionStorage.removeItem(key);
                  removedItemsSet.add(`session_${key}`);
                }
              });
              resolve();
            }, 0);
          });
        }
      })(),
      
      // Clear cookies
      (async () => {
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          if (name && (
              name.includes('supabase') || 
              name.includes('auth') || 
              name.includes('sb-') || 
              name.includes('token') || 
              name.includes('session')
          )) {
            if (!removedItemsSet.has(`cookie_${name}`)) {
              // Expire the cookie with all possible path/domain combinations
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
              removedItemsSet.add(`cookie_${name}`);
            }
          }
        });
      })()
    ]).then(() => {
      console.log("Parallel optimized session cleanup completed");
      
      // Clear specific Supabase-related items as a last resort
      ['supabase.auth.token', 'sb-refresh-token', 'sb-access-token', 'user_session'].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Garbage collection hint (may be ignored by the browser)
      if (window.gc) {
        try {
          (window as any).gc();
        } catch (e) {
          // Ignore if gc not available
        }
      }
    });
    
  } catch (error) {
    console.error("Error during optimized session cleanup:", error);
  }
};

/**
 * Throttled version of clearAllAuthData to prevent excessive calls
 */
export const throttledClearAllAuthData = throttle(clearAllAuthData, 300);

/**
 * Force reload the application with optimized cache busting
 */
export const forceAppReload = (): void => {
  console.log("Forcing optimized application reload");
  
  // Use a more efficient approach to cache busting
  const cacheBuster = `?t=${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
  
  // Clear navigation cache before reload
  if ('caches' in window) {
    try {
      // Only clear navigation cache to preserve other resources
      caches.delete('navigation-cache').catch(() => {});
    } catch (e) {
      console.warn("Could not clear navigation cache:", e);
    }
  }
  
  // Perform a minimal cleanup before reload
  ['supabase.auth.token', 'sb-access-token'].forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  // Use location.replace for more efficient page reload
  window.location.replace(`${window.location.pathname}${cacheBuster}`);
};
