
export const clearAllAuthData = () => {
  console.log("Clearing all auth data");
  
  // Clear specific Supabase session data
  localStorage.removeItem('sb-auth-token');
  localStorage.removeItem('supabase.auth.token');
  
  // Clear our custom session storage
  localStorage.removeItem('user_session');
  
  // Clear any auth-related localStorage items
  localStorage.removeItem('user_is_admin');
  localStorage.removeItem('admin_check_timestamp');
  localStorage.removeItem('sessionLastUpdated');
  
  // Clear any refresh tokens
  localStorage.removeItem('sb-refresh-token');
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

// Add the missing forceAppReload function
export const forceAppReload = () => {
  // Force a page reload to reset application state
  window.location.reload();
};

// Force logout with app reload
export const forceLogoutWithReload = () => {
  clearAllAuthData();
  forceAppReload();
};
