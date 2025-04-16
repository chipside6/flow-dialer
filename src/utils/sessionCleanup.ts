
export const clearAllAuthData = () => {
  console.log("Clearing all auth data");
  
  // Clear specific Supabase session data
  localStorage.removeItem('sb-auth-token');
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('sb-refresh-token');
  localStorage.removeItem('supabase.auth.expires_at');
  localStorage.removeItem('supabase.auth.refresh_token');
  
  // Clear our custom session storage
  localStorage.removeItem('user_session');
  
  // Clear any auth-related localStorage items
  localStorage.removeItem('user_is_admin');
  localStorage.removeItem('admin_check_timestamp');
  localStorage.removeItem('sessionLastUpdated');
  localStorage.removeItem('session_access_timestamp');

  // Clear ALL Supabase auth-related items
  // This comprehensive approach will clear any item that might be storing auth data
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase.auth.') || key.includes('sb-') || key.includes('supa') || key.includes('auth')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear session/local storage caches that might be used by the app
  try {
    // Clear application-specific caches
    Object.keys(localStorage).forEach(key => {
      if (key.includes('cache-') || key.includes('-cache')) {
        localStorage.removeItem(key);
      }
    });
    // Clear session storage as well
    sessionStorage.clear();
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
