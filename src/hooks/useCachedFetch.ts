
import { useState, useEffect, useCallback } from 'react';

interface CachedFetchOptions<T> {
  cacheKey?: string;
  cacheDuration?: number;
  enabled?: boolean;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

/**
 * Custom hook for fetching data with caching and loading state management
 * @param fetchFn - Function that returns a Promise with data
 * @param options - Configuration options for the fetch
 */
export function useCachedFetch<T>(
  fetchFn: () => Promise<T>,
  options: CachedFetchOptions<T> = {}
) {
  const {
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // Default: 5 minutes
    enabled = true,
    retry = 0,
    retryDelay = 2000,
    onSuccess,
    onError
  } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Get cached data if available
  useEffect(() => {
    if (!cacheKey) return;

    try {
      const cachedItem = localStorage.getItem(cacheKey);
      if (cachedItem) {
        const { data: storedData, timestamp } = JSON.parse(cachedItem);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - timestamp < cacheDuration) {
          setData(storedData);
          setLastFetched(timestamp);
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Error retrieving cached data:', err);
    }
  }, [cacheKey, cacheDuration]);

  // Define refetch function that doesn't cause infinite loop
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);

    const attemptFetch = async () => {
      try {
        const result = await fetchFn();
        setData(result);
        
        // Cache the result if cacheKey is provided
        if (cacheKey) {
          const now = Date.now();
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ data: result, timestamp: now })
          );
          setLastFetched(now);
        }
        
        setIsLoading(false);
        if (onSuccess) onSuccess(result);
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        if (retryCount < retry) {
          console.log(`Retry attempt ${retryCount + 1} of ${retry} after ${retryDelay}ms`);
          setRetryCount(prev => prev + 1);
          
          // Wait for retryDelay ms before trying again
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return attemptFetch();
        }
        
        console.error('Fetch error:', error);
        setError(error);
        setIsLoading(false);
        if (onError) onError(error);
        
        throw error;
      }
    };
    
    return attemptFetch();
  }, [fetchFn, cacheKey, retry, retryCount, retryDelay, onSuccess, onError]);

  // Fetch data on mount if enabled
  useEffect(() => {
    if (enabled) {
      refetch().catch(() => {
        // Error already handled in refetch
      });
    }
  }, [refetch, enabled]);

  return {
    data,
    isLoading,
    error,
    refetch,
    lastFetched,
  };
}

export default useCachedFetch;
