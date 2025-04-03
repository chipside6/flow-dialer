
import { getStoredSession } from "@/services/auth/session";
import { toast } from "@/components/ui/use-toast";

// HTTP Error class to handle API errors
export class HttpError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

// Function to handle common error responses
export const handleApiError = (error: unknown): HttpError => {
  if (error instanceof HttpError) {
    return error;
  }
  
  if (error instanceof Response) {
    return new HttpError(`API Error: ${error.statusText}`, error.status);
  }
  
  console.error('Unhandled API error:', error);
  return new HttpError('An unexpected error occurred', 500);
};

// Configurable retry options for API requests
export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryStatusCodes?: number[];
}

// Default retry configuration
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504]
};

// Helper for making authenticated API requests with retry logic
export const apiRequest = async <T>(
  url: string, 
  options: RequestInit = {},
  retryOptions?: RetryOptions
): Promise<T> => {
  const { 
    maxRetries = DEFAULT_RETRY_OPTIONS.maxRetries,
    retryDelay = DEFAULT_RETRY_OPTIONS.retryDelay,
    retryStatusCodes = DEFAULT_RETRY_OPTIONS.retryStatusCodes
  } = retryOptions || {};
  
  let retries = 0;
  let lastError: any;
  
  while (retries <= maxRetries) {
    try {
      // Get session for auth header
      const session = getStoredSession();
      
      // Set up headers
      const headers = new Headers(options.headers);
      
      // Add auth header if session exists
      if (session) {
        headers.set('Authorization', `Bearer ${session.user.id}`);
      }
      
      // If no Content-Type is set and we're not dealing with FormData, set it
      if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }
      
      // Add cache control for GET requests if not already set
      if (options.method === 'GET' && !headers.has('Cache-Control')) {
        headers.set('Cache-Control', 'no-cache');
      }
      
      // Make the request
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      // Check if response is ok
      if (!response.ok) {
        const status = response.status;
        
        // Check if we should retry based on status code
        if (retryStatusCodes.includes(status) && retries < maxRetries) {
          retries++;
          const delayMs = retryDelay * retries;
          console.log(`API request failed with status ${status}, retrying in ${delayMs}ms (${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, just use the status text
        }
        
        // Check for auth errors
        if (response.status === 401) {
          // Clear stored session if unauthorized
          localStorage.removeItem('user_session');
          
          // Show toast
          toast({
            title: "Authentication error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive"
          });
          
          // Redirect to login
          window.location.href = '/login';
        }
        
        throw new HttpError(errorMessage, response.status);
      }
      
      // Check for empty response (like for DELETE requests)
      if (response.status === 204) {
        return {} as T;
      }
      
      // Parse response as JSON
      return await response.json();
      
    } catch (error) {
      lastError = error;
      
      // Only retry network errors or whitelisted status codes
      if (error instanceof TypeError && error.message.includes('fetch') && retries < maxRetries) {
        retries++;
        const delayMs = retryDelay * retries;
        console.log(`Network error, retrying in ${delayMs}ms (${retries}/${maxRetries})`, error);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      
      // If it's an HTTP error with a retry status and we haven't hit max retries
      if (error instanceof HttpError && 
          retryStatusCodes.includes(error.status) && 
          retries < maxRetries) {
        retries++;
        const delayMs = retryDelay * retries;
        console.log(`API error (${error.status}), retrying in ${delayMs}ms (${retries}/${maxRetries})`, error);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      
      // Re-throw the error if it's not retryable or we've hit max retries
      throw error;
    }
  }
  
  // We should never reach here, but if we do, throw the last error
  throw lastError;
};

// Exponential backoff retry utility
export const withExponentialBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> => {
  let retries = 0;
  let lastError: any;
  
  while (retries <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (retries >= maxRetries) {
        break;
      }
      
      retries++;
      const delay = initialDelay * Math.pow(2, retries - 1);
      console.log(`Operation failed, retrying in ${delay}ms (${retries}/${maxRetries})`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Cache helper for API responses - simple in-memory implementation
const apiCache = new Map<string, {data: any, timestamp: number}>();

export const getFromCache = <T>(cacheKey: string, maxAge: number = 60000): T | null => {
  const cached = apiCache.get(cacheKey);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > maxAge) {
    apiCache.delete(cacheKey);
    return null;
  }
  
  return cached.data as T;
};

export const setInCache = <T>(cacheKey: string, data: T): void => {
  apiCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
};

// Clear entire cache or specific keys
export const clearCache = (cacheKey?: string): void => {
  if (cacheKey) {
    apiCache.delete(cacheKey);
  } else {
    apiCache.clear();
  }
};
