
export const clearAllAuthData = () => {
  // Clear Supabase session data
  localStorage.removeItem('sb-auth-token');
  localStorage.removeItem('supabase.auth.token');
  
  // Clear any auth-related localStorage items
  localStorage.removeItem('user_is_admin');
  localStorage.removeItem('admin_check_timestamp');
  localStorage.removeItem('sessionLastUpdated');
};

export const debouncedClearAllAuthData = clearAllAuthData;
