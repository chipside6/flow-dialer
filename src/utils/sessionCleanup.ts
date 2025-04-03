
// Add the missing export for debouncedClearAllAuthData
// Note: Since we don't have the original file, we're creating a placeholder implementation.
// This should be updated based on the actual implementation details of the file.

/**
 * Clears all authentication related data
 */
export const clearAllAuthData = () => {
  try {
    // Remove auth data from localStorage
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    
    // Clear any other auth-related storage items
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('auth') || key.includes('token') || key.includes('user')
    );
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('Successfully cleared all auth data');
  } catch (error) {
    console.error('Error clearing auth data:', error);
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
