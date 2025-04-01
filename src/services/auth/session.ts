
import { Session } from './types';

// Storage key for local session data
const SESSION_STORAGE_KEY = 'user_session';

// Get stored session with validation and expiry check
export const getStoredSession = (): Session | null => {
  const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!storedSession) return null;
  
  try {
    const session = JSON.parse(storedSession) as Session;
    
    // Check if session has expired
    if (session.expires_at) {
      const expiryTime = new Date(session.expires_at * 1000);
      const now = new Date();
      
      if (expiryTime < now) {
        console.log("Session has expired, clearing stored session");
        clearSession();
        return null;
      }
    }
    
    return session;
  } catch (error) {
    console.error('Error parsing stored session:', error);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

// Store session with safeguards
export const storeSession = (session: Session): void => {
  if (!session || !session.user) {
    console.error('Attempted to store invalid session', session);
    return;
  }
  
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to store session in localStorage:', error);
  }
};

// Clear session with improved error handling
export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    
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
