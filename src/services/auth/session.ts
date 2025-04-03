
import { Session } from './types';
import { debouncedClearAllAuthData } from '@/utils/sessionCleanup';

// Storage key for local session data
const SESSION_STORAGE_KEY = 'user_session';

// Cache the session in memory for faster access
let sessionCache: Session | null = null;
let sessionCacheExpiry: number = 0;

// Add validation utility functions
const isValidSession = (session: any): session is Session => {
  return (
    session && 
    typeof session === 'object' && 
    session.user && 
    typeof session.user === 'object' &&
    typeof session.user.id === 'string'
  );
};

/**
 * Get stored session with validation, expiry check, and memory caching
 * Performance optimized with memory caching
 */
export const getStoredSession = (): Session | null => {
  const now = Date.now();
  
  // Check memory cache first for better performance
  if (sessionCache && sessionCacheExpiry > now) {
    return sessionCache;
  }
  
  try {
    // Use a more efficient approach for retrieving and parsing session data
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedSession) return null;
    
    let session: Session;
    
    try {
      session = JSON.parse(storedSession) as Session;
    } catch (parseError) {
      console.error('Error parsing stored session:', parseError);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionCache = null;
      return null;
    }
    
    // Validate session structure
    if (!isValidSession(session)) {
      console.error('Invalid session structure:', session);
      localStorage.removeItem(SESSION_STORAGE_KEY);
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
    localStorage.removeItem(SESSION_STORAGE_KEY);
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
  
  try {
    // Store session in localStorage
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    
    // Update memory cache
    sessionCache = session;
    
    // Set cache expiry (1 minute or session expiry, whichever is sooner)
    const now = Date.now();
    if (session.expires_at) {
      const expiryTime = new Date(session.expires_at * 1000);
      sessionCacheExpiry = Math.min(
        now + 1 * 60 * 1000, // 1 minute
        expiryTime.getTime()
      );
    } else {
      sessionCacheExpiry = now + 1 * 60 * 1000;
    }
  } catch (error) {
    console.error('Failed to store session in localStorage:', error);
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
    
    // Remove specific session key
    localStorage.removeItem(SESSION_STORAGE_KEY);
    
    // Use our debounced cleanup utility for more efficient thorough session clearing
    debouncedClearAllAuthData();
  } catch (error) {
    console.error('Error clearing session:', error);
    
    // Last resort - try to clear everything
    try {
      localStorage.clear();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
    } catch (e) {
      console.error('Failed to clear storage as last resort:', e);
    }
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
  }
};

/**
 * Check if the session is valid and not expired - optimized for performance
 */
export const isSessionValid = (): boolean => {
  // Use memory cache if available before hitting localStorage
  if (sessionCache && sessionCacheExpiry > Date.now()) {
    return true;
  }
  return !!getStoredSession();
};

/**
 * Session validation utility that can be used for quick session checks
 * without loading the full session data
 */
export const hasValidSession = (): boolean => {
  try {
    // Quick check just looking for existence of token
    if (sessionCache) return true;
    return !!localStorage.getItem(SESSION_STORAGE_KEY);
  } catch (e) {
    return false;
  }
};
