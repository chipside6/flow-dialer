
import { useState, useEffect, useCallback } from 'react';

interface CachedFetchOptions<T> {
  cacheKey?: string;
  cacheDuration?: number;
  enabled?: boolean;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useCachedFetch<T>(
  fetchFn: () => Promise<T>,
  options: CachedFetchOptions<T> = {}
) {
  const {
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
    retry = 1,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const refetch = useCallback(async (forceRefresh = false): Promise<T | null> => {
    if (!enabled) return data;
    
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first unless force refresh is specified
      if (!forceRefresh && cacheKey) {
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(`${cacheKey}_time`);
        
        if (cachedData && cachedTime) {
          const parsedTime = parseInt(cachedTime, 10);
          const now = Date.now();
          
          // Use cache if it's still valid
          if (now - parsedTime < cacheDuration) {
            try {
              const parsed = JSON.parse(cachedData);
              setData(parsed);
              onSuccess?.(parsed);
              setIsLoading(false);
              return parsed;
            } catch (e) {
              console.error("Error parsing cached data:", e);
              // Continue with fetch if parsing fails
            }
          }
        }
      }
      
      // Perform the fetch
      const result = await fetchFn();
      
      // Update cache if cacheKey is provided
      if (cacheKey) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
          localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
        } catch (e) {
          console.error("Error caching data:", e);
        }
      }
      
      setData(result);
      setRetryCount(0);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error(String(err));
      console.error("Fetch error:", fetchError);
      
      // Retry logic
      if (retryCount < retry) {
        console.log(`Retrying fetch (${retryCount + 1}/${retry})...`);
        setRetryCount(prevCount => prevCount + 1);
        
        setTimeout(() => {
          refetch(forceRefresh);
        }, retryDelay);
      } else {
        setError(fetchError);
        onError?.(fetchError);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [
    cacheKey, 
    cacheDuration, 
    enabled, 
    retry, 
    retryCount, 
    retryDelay, 
    fetchFn, 
    data, 
    onSuccess, 
    onError
  ]);

  // Initial fetch on mount if enabled
  useEffect(() => {
    if (enabled) {
      refetch();
    }
  }, [enabled, refetch]);

  return {
    data,
    isLoading,
    error,
    refetch
  };
}
