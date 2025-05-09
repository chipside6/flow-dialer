
import { Session } from './types';
import { debouncedClearAllAuthData, forceAppReload } from '@/utils/sessionCleanup';

// Storage key for session data
const SESSION_STORAGE_KEY = 'user_session';
const ADMIN_STATUS_KEY = 'user_is_admin'; 
const SESSION_ACCESS_TIMESTAMP = 'session_access_timestamp';

// Cache the session in memory for faster access
let sessionCache: Session | null = null;
let sessionCacheExpiry: number = 0;
let adminStatusCache: boolean | null = null;
let lastAccessTime: number = Date.now(); // Initialize with current time

// Add validation utility functions
const isValidSession = (session: any): session is Session => {
  return (
    session && 
    typeof session === 'object' && 
    session.user && 
    typeof session.user === 'object' &&
    typeof session.user.id === 'string' &&
    (session.token || session.access_token)  // Check for either token format
  );
};

/**
 * Get stored session with validation, expiry check, and memory caching
 * Performance optimized with memory caching
 */
export const getStoredSession = (): Session | null => {
  const now = Date.now();
  
  // Update last access time to prevent premature session expiry
  sessionStorage.setItem(SESSION_ACCESS_TIMESTAMP, now.toString());
  lastAccessTime = now;
  
  // Check memory cache first for better performance
  if (sessionCache && sessionCacheExpiry > now) {
    return sessionCache;
  }
  
  try {
    // Use a more efficient approach for retrieving and parsing session data
    const storedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedSession) return null;
    
    let session: Session;
    
    try {
      session = JSON.parse(storedSession) as Session;
    } catch (parseError) {
      console.error('Error parsing stored session:', parseError);
      sessionCache = null;
      return null;
    }
    
    // Normalize token field (some APIs use token, others use access_token)
    if (session.access_token && !session.token) {
      session.token = session.access_token;
    } else if (session.token && !session.access_token) {
      session.access_token = session.token;
    }
    
    // Validate session structure
    if (!isValidSession(session)) {
      console.error('Invalid session structure:', session);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionCache = null;
      return null;
    }
    
    // Check if session has expired
    if (session.expires_at) {
      const expiryTime = new Date(session.expires_at * 1000);
      const currentTime = new Date();
      
      if (expiryTime < currentTime) {
        console.log("Session has expired, clearing stored session");
        clearSession();
        return null;
      }
      
      // Set the expiry time for the memory cache (1 minute or session expiry, whichever is sooner)
      const cacheExpiry = Math.min(
        now + 1 * 60 * 1000, // 1 minute
        expiryTime.getTime()
      );
      
      // Update memory cache
      sessionCache = session;
      sessionCacheExpiry = cacheExpiry;
    } else {
      // If no expiry time, cache for 1 minute
      sessionCache = session;
      sessionCacheExpiry = now + 1 * 60 * 1000;
    }
    
    return session;
  } catch (error) {
    console.error('Error retrieving stored session:', error);
    sessionCache = null;
    return null;
  }
};

/**
 * Store session with safeguards and update memory cache
 * Performance optimized by using memory cache
 */
export const storeSession = (session: Session): void => {
  if (!isValidSession(session)) {
    console.error('Attempted to store invalid session', session);
    return;
  }
  
  // Normalize token field (some APIs use token, others use access_token)
  if (session.access_token && !session.token) {
    session.token = session.access_token;
  } else if (session.token && !session.access_token) {
    session.access_token = session.token;
  }
  
  try {
    // Store session in sessionStorage
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    
    // Update last access time
    const currentTime = Date.now();
    sessionStorage.setItem(SESSION_ACCESS_TIMESTAMP, currentTime.toString());
    lastAccessTime = currentTime;
    
    // Update memory cache
    sessionCache = session;
    
    // Set cache expiry (1 minute or session expiry, whichever is sooner)
    if (session.expires_at) {
      const expiryTime = new Date(session.expires_at * 1000);
      sessionCacheExpiry = Math.min(
        currentTime + 1 * 60 * 1000, // 1 minute
        expiryTime.getTime()
      );
    } else {
      sessionCacheExpiry = currentTime + 1 * 60 * 1000;
    }
  } catch (error) {
    console.error('Failed to store session in sessionStorage:', error);
  }
};

/**
 * Store the admin status separately for persistence
 */
export const storeAdminStatus = (isAdmin: boolean): void => {
  try {
    sessionStorage.setItem(ADMIN_STATUS_KEY, isAdmin ? 'true' : 'false');
    adminStatusCache = isAdmin;
    
    // Store timestamp to know when this was last checked
    sessionStorage.setItem('admin_check_timestamp', Date.now().toString());
  } catch (error) {
    console.error('Failed to store admin status in sessionStorage:', error);
  }
};

/**
 * Retrieve the stored admin status
 */
export const getStoredAdminStatus = (): boolean | null => {
  // Return from cache if available
  if (adminStatusCache !== null) return adminStatusCache;
  
  try {
    const status = sessionStorage.getItem(ADMIN_STATUS_KEY);
    if (status === null) return null;
    
    adminStatusCache = status === 'true';
    return adminStatusCache;
  } catch (error) {
    console.error('Failed to retrieve admin status from sessionStorage:', error);
    return null;
  }
};

/**
 * Clear session with optimized cleanup approach
 */
export const clearSession = (): void => {
  try {
    // Clear in-memory cache first for immediate effect
    sessionCache = null;
    sessionCacheExpiry = 0;
    adminStatusCache = null;
    
    // Remove specific session key
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(ADMIN_STATUS_KEY);
    sessionStorage.removeItem('admin_check_timestamp');
    sessionStorage.removeItem(SESSION_ACCESS_TIMESTAMP);
    
    // Use our debounced cleanup utility for more efficient thorough session clearing
    debouncedClearAllAuthData();
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};

/**
 * Refresh the session expiry time
 */
export const refreshSession = (newExpiresAt: number): void => {
  const session = getStoredSession();
  if (session) {
    session.expires_at = newExpiresAt;
    storeSession(session);
    console.log("Session expiry refreshed to:", new Date(newExpiresAt * 1000));
    
    // Update last access time
    const now = Date.now();
    sessionStorage.setItem(SESSION_ACCESS_TIMESTAMP, now.toString());
    lastAccessTime = now;
  }
};

/**
 * Touch session to update last access time without changing anything else
 */
export const touchSession = (): void => {
  const now = Date.now();
  sessionStorage.setItem(SESSION_ACCESS_TIMESTAMP, now.toString());
  lastAccessTime = now;
  console.log("Session touched at:", new Date(now).toISOString());
};

/**
 * Check if the session is valid and not expired
 */
export const isSessionValid = (): boolean => {
  // Touch the session to record the access
  touchSession();
  
  // Use memory cache if available before hitting sessionStorage
  if (sessionCache && sessionCacheExpiry > Date.now()) {
    return true;
  }
  
  const session = getStoredSession();
  const isValid = !!session;
  
  if (!isValid) {
    console.warn("Session is not valid");
  }
  
  return isValid;
};

/**
 * Session validation utility that can be used for quick session checks
 */
export const hasValidSession = (): boolean => {
  try {
    // Quick check just looking for existence of token
    if (sessionCache) return true;
    return !!sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch (e) {
    return false;
  }
};

/**
 * Force logout and session cleanup with page reload
 */
export const forceLogout = (): void => {
  clearSession();
  forceAppReload();
};
