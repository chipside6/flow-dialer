
/**
 * Comprehensive session and token cleanup utilities
 * Used to ensure complete logout and prevent automatic sign-in
 */

/**
 * Aggressively clears all authentication-related data from browser storage
 */
export const clearAllAuthData = (): void => {
  console.log("Performing aggressive session cleanup");
  
  try {
    // Clear localStorage items - focus on auth-related keys first
    const localStorageKeys = Object.keys(localStorage);
    for (const key of localStorageKeys) {
      if (key.includes('supabase') || 
          key.includes('auth') || 
          key.includes('session') || 
          key.includes('token') || 
          key.includes('user')) {
        console.log(`Removing localStorage item: ${key}`);
        localStorage.removeItem(key);
      }
    }
    
    // Clear sessionStorage items
    const sessionStorageKeys = Object.keys(sessionStorage);
    for (const key of sessionStorageKeys) {
      if (key.includes('supabase') || 
          key.includes('auth') || 
          key.includes('session') || 
          key.includes('token') || 
          key.includes('user')) {
        console.log(`Removing sessionStorage item: ${key}`);
        sessionStorage.removeItem(key);
      }
    }
    
    // Clear authentication cookies with proper domain and path
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name.includes('supabase') || 
          name.includes('auth') || 
          name.includes('sb-') || 
          name.includes('token') || 
          name.includes('session')) {
        console.log(`Removing cookie: ${name}`);
        // Expire the cookie with all possible path/domain combinations
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      }
    });
    
    // As a last resort, clear specific Supabase-related items
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('sb-refresh-token');
    localStorage.removeItem('sb-access-token');
    localStorage.removeItem('user_session');
    sessionStorage.removeItem('supabase.auth.token');
    
    console.log("Session cleanup completed");
  } catch (error) {
    console.error("Error during aggressive session cleanup:", error);
  }
};

/**
 * Force reload the application to ensure a clean slate
 */
export const forceAppReload = (): void => {
  console.log("Forcing application reload");
  
  // Add cache-busting parameter to prevent browser cache issues
  const cacheBuster = `?cache=${Date.now()}`;
  
  // Replace current URL with cache-busting parameter and force reload
  window.location.href = `${window.location.pathname}${cacheBuster}`;
};
