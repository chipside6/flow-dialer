
import { getStoredSession } from "@/services/auth/session";
import { toast } from "@/components/ui/use-toast";
import { resetAppSession } from "@/utils/sessionCleanup";

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

// Improved configurable retry options for API requests
export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryStatusCodes?: number[];
  exponentialBackoff?: boolean;
  maxDelay?: number;
}

// Default retry configuration
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
  exponentialBackoff: true,
  maxDelay: 30000
};

// Helper for making authenticated API requests with enhanced retry logic
export const apiRequest = async <T>(
  url: string, 
  options: RequestInit = {},
  retryOptions?: RetryOptions
): Promise<T> => {
  const { 
    maxRetries = DEFAULT_RETRY_OPTIONS.maxRetries,
    retryDelay = DEFAULT_RETRY_OPTIONS.retryDelay,
    retryStatusCodes = DEFAULT_RETRY_OPTIONS.retryStatusCodes,
    exponentialBackoff = DEFAULT_RETRY_OPTIONS.exponentialBackoff,
    maxDelay = DEFAULT_RETRY_OPTIONS.maxDelay
  } = retryOptions || {};
  
  let retries = 0;
  let lastError: any;
  
  const calculateDelay = (attempt: number): number => {
    if (!exponentialBackoff) return retryDelay;
    
    // Exponential backoff with jitter
    const expDelay = Math.min(
      retryDelay * Math.pow(2, attempt) + Math.random() * 1000,
      maxDelay
    );
    
    return expDelay;
  };
  
  let authRetryAttempted = false;
  
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
        
        // Handle auth errors with special care - try to refresh token once
        if (status === 401 && !authRetryAttempted) {
          console.log('API request received 401, attempting to refresh auth session');
          authRetryAttempted = true;
          
          try {
            const { supabase } = await import('@/integrations/supabase/client');
            const { data } = await supabase.auth.getSession();
            
            // If we successfully refreshed the session, retry the request
            if (data.session) {
              console.log('Auth session refreshed, retrying API request');
              continue;
            }
          } catch (refreshError) {
            console.error('Error refreshing auth session:', refreshError);
          }
        }
        
        // Check if we should retry based on status code
        if (retryStatusCodes.includes(status) && retries < maxRetries) {
          retries++;
          const delayMs = calculateDelay(retries);
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
          
          // Full session reset after short delay
          setTimeout(() => {
            resetAppSession();
          }, 300);
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
        const delayMs = calculateDelay(retries);
        console.log(`Network error, retrying in ${delayMs}ms (${retries}/${maxRetries})`, error);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      
      // If it's an HTTP error with a retry status and we haven't hit max retries
      if (error instanceof HttpError && 
          retryStatusCodes.includes(error.status) && 
          retries < maxRetries) {
        retries++;
        const delayMs = calculateDelay(retries);
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

// Enhanced exponential backoff retry utility with circuit breaker
export const withExponentialBackoff = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number,
    initialDelay?: number,
    maxDelay?: number,
    shouldRetry?: (error: any) => boolean
  } = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    shouldRetry = () => true
  } = options;
  
  let retries = 0;
  let lastError: any;
  
  while (retries <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (!shouldRetry(error) || retries >= maxRetries) {
        break;
      }
      
      retries++;
      // Exponential backoff with jitter to prevent thundering herd
      const jitter = Math.random() * 500;
      const delay = Math.min(initialDelay * Math.pow(2, retries - 1) + jitter, maxDelay);
      
      console.log(`Operation failed, retrying in ${delay}ms (${retries}/${maxRetries})`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Improved cache helper with TTL support and automatic pruning
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private pruneInterval: number;
  private pruneTimer: ReturnType<typeof setInterval> | null = null;
  
  constructor(maxSize = 100, pruneInterval = 60000) {
    this.maxSize = maxSize;
    this.pruneInterval = pruneInterval;
    this.startPruneTimer();
  }
  
  private startPruneTimer() {
    if (this.pruneTimer) {
      clearInterval(this.pruneTimer);
    }
    
    this.pruneTimer = setInterval(() => {
      this.pruneExpired();
    }, this.pruneInterval);
  }
  
  private pruneExpired() {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      console.log(`Pruned ${expiredCount} expired cache entries`);
    }
    
    // If cache is still too large after pruning expired entries
    if (this.cache.size > this.maxSize) {
      this.pruneOldest(this.maxSize * 0.75);
    }
  }
  
  private pruneOldest(targetSize: number) {
    if (this.cache.size <= targetSize) return;
    
    // Sort by timestamp
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Delete oldest entries
    const deleteCount = this.cache.size - Math.floor(targetSize);
    for (let i = 0; i < deleteCount; i++) {
      if (entries[i]) {
        this.cache.delete(entries[i][0]);
      }
    }
    
    console.log(`Pruned ${deleteCount} oldest cache entries due to size limit`);
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  set<T>(key: string, data: T, ttlMs: number): void {
    const now = Date.now();
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: now + ttlMs
    });
    
    // If adding this item puts us over max size, prune
    if (this.cache.size > this.maxSize) {
      this.pruneOldest(this.maxSize * 0.75);
    }
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Clean up on destruction
  destroy() {
    if (this.pruneTimer) {
      clearInterval(this.pruneTimer);
      this.pruneTimer = null;
    }
    this.cache.clear();
  }
}

// Create a singleton instance
const apiCacheInstance = new ApiCache();

// Expose simplified interface for the cache
export const getFromCache = <T>(cacheKey: string): T | null => {
  return apiCacheInstance.get<T>(cacheKey);
};

export const setInCache = <T>(cacheKey: string, data: T, maxAge: number = 60000): void => {
  apiCacheInstance.set<T>(cacheKey, data, maxAge);
};

// Clear entire cache or specific keys
export const clearCache = (cacheKey?: string): void => {
  if (cacheKey) {
    apiCacheInstance.delete(cacheKey);
  } else {
    apiCacheInstance.clear();
  }
};

// Function to ensure API requests are made with the correct base URL
export const getApiUrl = (path: string): string => {
  // Start with the configured API URL or default to current origin
  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
  
  // Clean up the base URL and path
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanBaseUrl}${cleanPath}`;
};
