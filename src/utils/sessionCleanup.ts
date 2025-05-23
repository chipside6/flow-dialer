
export const clearAllAuthData = () => {
  console.log("Clearing all auth data");
  
  // Clear specific Supabase session data
  sessionStorage.removeItem('sb-auth-token');
  localStorage.removeItem('sb-auth-token');
  sessionStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('supabase.auth.token');
  sessionStorage.removeItem('sb-refresh-token');
  localStorage.removeItem('sb-refresh-token');
  sessionStorage.removeItem('supabase.auth.expires_at');
  localStorage.removeItem('supabase.auth.expires_at');
  sessionStorage.removeItem('supabase.auth.refresh_token');
  localStorage.removeItem('supabase.auth.refresh_token');
  
  // Clear current Supabase session from both storages
  sessionStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('supabase.auth.token');
  
  // Clear our custom session storage
  sessionStorage.removeItem('user_session');
  localStorage.removeItem('user_session');
  
  // Clear any auth-related sessionStorage items
  sessionStorage.removeItem('user_is_admin');
  localStorage.removeItem('user_is_admin');
  sessionStorage.removeItem('admin_check_timestamp');
  localStorage.removeItem('admin_check_timestamp');
  sessionStorage.removeItem('sessionLastUpdated');
  localStorage.removeItem('sessionLastUpdated');
  sessionStorage.removeItem('session_access_timestamp');
  localStorage.removeItem('session_access_timestamp');

  // Clear ALL Supabase auth-related items from both storages
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase.auth.') || key.includes('sb-') || key.includes('supa') || key.includes('auth')) {
      localStorage.removeItem(key);
    }
  });
  
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('supabase.auth.') || key.includes('sb-') || key.includes('supa') || key.includes('auth')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // Also clear cache items that might cause stale data
  try {
    // Clear application-specific caches from both storages
    Object.keys(localStorage).forEach(key => {
      if (key.includes('cache-') || key.includes('-cache')) {
        localStorage.removeItem(key);
      }
    });
    
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('cache-') || key.includes('-cache')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error("Error clearing caches:", e);
  }
};

// Provide a debounced version in case multiple components call it
let clearAllAuthDataTimeoutId: number | null = null;
export const debouncedClearAllAuthData = () => {
  if (clearAllAuthDataTimeoutId) {
    clearTimeout(clearAllAuthDataTimeoutId);
  }
  
  clearAllAuthDataTimeoutId = window.setTimeout(() => {
    clearAllAuthData();
    clearAllAuthDataTimeoutId = null;
  }, 50) as unknown as number;
};

// Force app reload with cache busting
export const forceAppReload = () => {
  // Force a page reload to reset application state
  window.location.href = window.location.origin + '/login?t=' + new Date().getTime();
};

// Force logout with app reload
export const forceLogoutWithReload = () => {
  clearAllAuthData();
  forceAppReload();
};
