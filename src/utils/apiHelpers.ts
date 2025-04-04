
/**
 * Utility functions for API requests with enhanced error handling and retry logic
 */

import { forceAppReload } from './sessionCleanup';
import { toast } from '@/components/ui/use-toast';

// Type for function that can be retried
type RetryableFunction<T> = () => Promise<T>;

// Options for withExponentialBackoff
interface BackoffOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  onRetry?: (attempt: number, error: Error, nextDelay: number) => void;
  shouldRetry?: (error: Error) => boolean;
}

/**
 * Execute a function with exponential backoff retry logic
 * @param fn Function to execute and potentially retry
 * @param options Backoff configuration options
 * @returns Promise with the result of the function
 */
export async function withExponentialBackoff<T>(
  fn: RetryableFunction<T>,
  options: BackoffOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
    onRetry = () => {},
    shouldRetry = () => true
  } = options;

  let attempt = 0;
  let lastError: Error;

  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry based on the error
      if (!shouldRetry(lastError)) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        initialDelay * Math.pow(factor, attempt) * (0.9 + Math.random() * 0.2),
        maxDelay
      );
      
      // Call onRetry callback with details
      onRetry(attempt, lastError, delay);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      attempt++;
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError!;
}

/**
 * Automatically retry API requests with smart error handling for auth issues
 * @param apiCall The API function to call
 * @param options Additional options for retry behavior
 * @returns Promise with the API result
 */
export async function withAutoRetry<T>(
  apiCall: RetryableFunction<T>,
  options: Omit<BackoffOptions, 'shouldRetry' | 'onRetry'> & {
    silent?: boolean;
    criticalOperation?: boolean;
  } = {}
): Promise<T> {
  const { silent = false, criticalOperation = false, ...backoffOptions } = options;
  
  try {
    return await withExponentialBackoff(apiCall, {
      ...backoffOptions,
      shouldRetry: (error) => {
        // Don't retry on authentication errors - they need user intervention
        if (error.message?.includes('auth') || 
            error.message?.includes('unauthorized') || 
            error.message?.includes('authentication')) {
          return false;
        }
        
        // Don't retry on user-specific errors
        if (error.message?.includes('permission') || 
            error.message?.includes('not allowed') || 
            error.message?.includes('forbidden')) {
          return false;
        }
        
        // Do retry on network errors or rate limiting
        return true;
      },
      onRetry: (attempt, error, nextDelay) => {
        console.warn(`API call failed (attempt ${attempt + 1}). Retrying in ${Math.round(nextDelay)}ms`, error);
        
        // Only show toast for critical operations
        if (criticalOperation && !silent) {
          toast({
            title: "Connection issue",
            description: "We're having trouble connecting. Retrying...",
            variant: "destructive"
          });
        }
      }
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    // Handle authentication errors by reloading the page
    if (err.message?.includes('authentication') || 
        err.message?.includes('JWT') || 
        err.message?.includes('token')) {
      
      if (!silent) {
        toast({
          title: "Authentication error",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive"
        });
      }
      
      // Force app reload to refresh auth state
      setTimeout(() => forceAppReload(), 1500);
      throw err;
    }
    
    // For other errors, just log and rethrow
    console.error("API call failed after retries:", err);
    
    if (!silent) {
      toast({
        title: "Operation failed",
        description: err.message || "Please try again later",
        variant: "destructive"
      });
    }
    
    throw err;
  }
}

/**
 * Check if the current error is due to the user being offline
 */
export function isOfflineError(error: Error): boolean {
  return error.message?.includes('network') || 
         error.message?.includes('offline') || 
         error.message?.includes('connection') ||
         navigator.onLine === false;
}

/**
 * Check if an error is related to authentication
 */
export function isAuthError(error: Error): boolean {
  return error.message?.includes('authentication') || 
         error.message?.includes('JWT') || 
         error.message?.includes('token') ||
         error.message?.includes('unauthorized') ||
         error.message?.includes('auth');
}
