
import { getStoredSession } from "../authService";

// Replace with your custom backend URL
export const API_URL = 'http://localhost:3001/api';

/**
 * Helper function to add auth headers to requests
 */
export const getAuthHeaders = (): Record<string, string> => {
  const session = getStoredSession();
  return session ? { 'Authorization': `Bearer ${session.user.id}` } : {};
};

/**
 * Base fetch function with common error handling
 */
export const apiFetch = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  try {
    const headers = {
      ...getAuthHeaders(),
      ...(options.headers || {})
    };

    // Only set Content-Type if it's not already set and not FormData
    if (
      !options.headers?.hasOwnProperty('Content-Type') && 
      !(options.body instanceof FormData)
    ) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    // For responses that should return JSON
    if (response.headers.get('content-type')?.includes('application/json')) {
      return await response.json();
    }

    return {} as T;
  } catch (error) {
    console.error(`[API] Error in fetch:`, error);
    throw error;
  }
};
