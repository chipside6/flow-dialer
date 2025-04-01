
import { useState, useEffect, useCallback, useRef } from "react";

// Simple in-memory cache
const cache: Record<string, {
  data: any;
  timestamp: number;
  expiresAt: number;
}> = {};

interface UseCachedFetchOptions {
  cacheKey?: string;
  cacheDuration?: number; // In milliseconds
  enabled?: boolean;
  dedupingInterval?: number; // Prevent duplicate requests within this timeframe
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retry?: number; // Number of retry attempts
  retryDelay?: number; // Delay between retries in ms
}

/**
 * A hook for fetching data with caching capabilities
 */
export function useCachedFetch<T>(
  fetcher: () => Promise<T>,
  options: UseCachedFetchOptions = {}
) {
  const {
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
    dedupingInterval = 2000, // 2 seconds
    onSuccess,
    onError,
    retry = 1,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const fetchingRef = useRef<boolean>(false);

  const executeWithRetry = useCallback(async (attempt: number = 0): Promise<T> => {
    try {
      const result = await fetcher();
      return result;
    } catch (err) {
      if (attempt < retry) {
        console.log(`Fetch attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return executeWithRetry(attempt + 1);
      }
      throw err;
    }
  }, [fetcher, retry, retryDelay]);

  const fetchData = useCallback(async (force: boolean = false) => {
    if (!enabled || (!force && fetchingRef.current)) {
      return;
    }

    const now = Date.now();
    const shouldDedupe = !force && now - lastFetchTimeRef.current < dedupingInterval;
    
    if (shouldDedupe) {
      console.log("Request deduped due to deduping interval");
      return;
    }

    // Check cache if we have a cacheKey
    if (cacheKey && !force) {
      const cached = cache[cacheKey];
      if (cached && cached.expiresAt > now) {
        console.log(`Using cached data for key: ${cacheKey}`);
        if (isMountedRef.current) {
          setData(cached.data);
          setIsLoading(false);
          setError(null);
          onSuccess?.(cached.data);
        }
        return;
      }
    }

    fetchingRef.current = true;
    if (isMountedRef.current) {
      setIsLoading(true);
      setError(null);
    }
    
    lastFetchTimeRef.current = now;

    try {
      const result = await executeWithRetry();
      
      // Update cache if we have a cacheKey
      if (cacheKey) {
        cache[cacheKey] = {
          data: result,
          timestamp: now,
          expiresAt: now + cacheDuration
        };
      }

      if (isMountedRef.current) {
        setData(result);
        setIsLoading(false);
        onSuccess?.(result);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      fetchingRef.current = false;
    }
  }, [cacheKey, cacheDuration, dedupingInterval, enabled, fetcher, executeWithRetry, onSuccess, onError]);

  // Invalidate cache for a specific key
  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      delete cache[key];
    } else if (cacheKey) {
      delete cache[cacheKey];
    }
  }, [cacheKey]);

  // Clear entire cache
  const clearCache = useCallback(() => {
    Object.keys(cache).forEach(key => {
      delete cache[key];
    });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (enabled) {
      fetchData();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [enabled, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: (force: boolean = true) => fetchData(force),
    invalidateCache,
    clearCache
  };
}
