
import { Session } from './types';

// Storage key for local session data
const SESSION_STORAGE_KEY = 'user_session';

// Cache the session in memory for faster access
let sessionCache: Session | null = null;
let sessionCacheExpiry: number = 0;

/**
 * Get stored session with validation, expiry check, and memory caching
 */
export const getStoredSession = (): Session | null => {
  const now = Date.now();
  
  // Check memory cache first for better performance
  if (sessionCache && sessionCacheExpiry > now) {
    return sessionCache;
  }
  
  try {
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedSession) return null;
    
    const session = JSON.parse(storedSession) as Session;
    
    // Check if session has expired
    if (session.expires_at) {
      const expiryTime = new Date(session.expires_at * 1000);
      const currentTime = new Date();
      
      if (expiryTime < currentTime) {
        console.log("Session has expired, clearing stored session");
        clearSession();
        return null;
      }
      
      // Set the expiry time for the memory cache (5 minutes or session expiry, whichever is sooner)
      const cacheExpiry = Math.min(
        now + 5 * 60 * 1000, // 5 minutes
        expiryTime.getTime()
      );
      
      // Update memory cache
      sessionCache = session;
      sessionCacheExpiry = cacheExpiry;
    } else {
      // If no expiry time, cache for 5 minutes
      sessionCache = session;
      sessionCacheExpiry = now + 5 * 60 * 1000;
    }
    
    return session;
  } catch (error) {
    console.error('Error parsing stored session:', error);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionCache = null;
    return null;
  }
};

/**
 * Store session with safeguards and update memory cache
 */
export const storeSession = (session: Session): void => {
  if (!session || !session.user) {
    console.error('Attempted to store invalid session', session);
    return;
  }
  
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    
    // Update memory cache
    sessionCache = session;
    
    // Set cache expiry (5 minutes or session expiry, whichever is sooner)
    const now = Date.now();
    if (session.expires_at) {
      const expiryTime = new Date(session.expires_at * 1000);
      sessionCacheExpiry = Math.min(
        now + 5 * 60 * 1000, // 5 minutes
        expiryTime.getTime()
      );
    } else {
      sessionCacheExpiry = now + 5 * 60 * 1000;
    }
  } catch (error) {
    console.error('Failed to store session in localStorage:', error);
  }
};

/**
 * Clear session with improved error handling and clear memory cache
 */
export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    
    // Clear memory cache
    sessionCache = null;
    sessionCacheExpiry = 0;
    
    // Also clear any potential Supabase session tokens for good measure
    for (const key of Object.keys(localStorage)) {
      if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Failed to remove potential auth key ${key}:`, e);
        }
      }
    }
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
  }
};

/**
 * Check if the session is valid and not expired
 */
export const isSessionValid = (): boolean => {
  const session = getStoredSession();
  return !!session;
};
