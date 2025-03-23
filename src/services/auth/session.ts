
import { Session } from './types';

// Storage key for local session data
const SESSION_STORAGE_KEY = 'user_session';

// Get stored session
export const getStoredSession = (): Session | null => {
  const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!storedSession) return null;
  
  try {
    return JSON.parse(storedSession);
  } catch (error) {
    console.error('Error parsing stored session:', error);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

// Store session
export const storeSession = (session: Session): void => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

// Clear session
export const clearSession = (): void => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};
