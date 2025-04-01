
import { getStoredSession } from "../authService";
import { 
  PRODUCTION_API_URL, 
  MAX_RETRY_ATTEMPTS, 
  REQUEST_TIMEOUT,
  ENABLE_DETAILED_LOGGING 
} from "./productionConfig";

// Use the configured production URL or fallback to development URL
export const API_URL = import.meta.env.VITE_API_URL || PRODUCTION_API_URL;

// Log configuration on startup (only in development)
if (import.meta.env.DEV) {
  console.log(`[API] Using API URL: ${API_URL}`);
}

/**
 * Helper function to add auth headers to requests
 */
export const getAuthHeaders = (): Record<string, string> => {
  const session = getStoredSession();
  return session ? { 'Authorization': `Bearer ${session.user.id}` } : {};
};

/**
 * Base fetch function with common error handling and retry logic
 */
export const apiFetch = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  let retries = 0;
  
  const executeRequest = async (): Promise<T> => {
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(`${API_URL}/${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      // For responses that should return JSON
      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        return data as T;
      }

      return {} as T;
    } catch (error) {
      if (ENABLE_DETAILED_LOGGING) {
        console.error(`[API] Error in fetch (attempt ${retries + 1}):`, error);
      }
      
      // Retry logic for network errors or server errors (5xx)
      if (retries < MAX_RETRY_ATTEMPTS) {
        retries++;
        // Exponential backoff
        const delay = Math.min(1000 * 2 ** retries, 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeRequest();
      }
      
      throw error;
    }
  };

  return executeRequest();
};
