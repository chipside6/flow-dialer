
import { useState, useEffect, useCallback, useRef } from "react";

// Advanced in-memory cache with optimized time-to-live and memory management
const cache: Record<string, {
  data: any;
  timestamp: number;
  expiresAt: number;
}> = {};

// LRU cache implementation to limit memory usage
class LRUCache {
  private capacity: number;
  private cache: Map<string, number>;
  
  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key: string): boolean {
    if (!this.cache.has(key)) return false;
    
    // Move accessed key to the end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return true;
  }
  
  put(key: string, value: number): void {
    // If already exists, refresh its position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } 
    // If at capacity, remove the least recently used item
    else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      // Also remove from the main cache
      delete cache[firstKey];
    }
    
    // Add the new key
    this.cache.set(key, value);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// Create an LRU cache instance with a capacity of 100 items
const lruCache = new LRUCache(100);

// Cache maintenance function to periodically clear expired items
const maintainCache = () => {
  const now = Date.now();
  Object.keys(cache).forEach(key => {
    if (cache[key].expiresAt < now) {
      delete cache[key];
    }
  });
};

// Run cache maintenance every 5 minutes
setInterval(maintainCache, 5 * 60 * 1000);

interface UseCachedFetchOptions {
  cacheKey?: string;
  cacheDuration?: number; // In milliseconds
  enabled?: boolean;
  dedupingInterval?: number; // Prevent duplicate requests within this timeframe
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retry?: number; // Number of retry attempts
  retryDelay?: number; // Delay between retries in ms
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh data
}

/**
 * A hook for fetching data with enhanced caching capabilities and performance optimizations
 */
export function useCachedFetch<T>(
  fetcher: () => Promise<T>,
  options: UseCachedFetchOptions = {}
) {
  const {
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
    dedupingInterval = 300, // Reduced for faster operations
    onSuccess,
    onError,
    retry = 1,
    retryDelay = 1000,
    staleWhileRevalidate = true // Enable by default for better performance
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const fetchingRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef<number>(0);

  // Pre-load from cache on mount - improved performance implementation
  useEffect(() => {
    if (cacheKey && enabled) {
      const cachedData = cache[cacheKey];
      const now = Date.now();
      
      if (cachedData) {
        // Update LRU cache tracking
        lruCache.get(cacheKey);
        
        if (cachedData.expiresAt > now) {
          // Valid cache hit
          setData(cachedData.data);
          if (!staleWhileRevalidate) {
            setIsLoading(false);
          }
        } else if (staleWhileRevalidate) {
          // Return stale data while fetching fresh data
          setData(cachedData.data);
          // We'll still fetch fresh data below
        }
      }
    }
  }, [cacheKey, enabled, staleWhileRevalidate]);

  // Clean up function for abort controllers and timers
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const executeWithRetry = useCallback(async (attempt: number = 0, requestId: number): Promise<T | null> => {
    try {
      if (!isMountedRef.current || requestId !== requestIdRef.current) {
        return null;
      }
      
      const result = await fetcher();
      return result;
    } catch (err) {
      if (attempt < retry && isMountedRef.current && requestId === requestIdRef.current) {
        console.log(`Fetch attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`);
        
        // Use a new promise with timeout for retry
        return new Promise((resolve) => {
          retryTimerRef.current = setTimeout(() => {
            if (isMountedRef.current && requestId === requestIdRef.current) {
              resolve(executeWithRetry(attempt + 1, requestId));
            } else {
              resolve(null);
            }
          }, retryDelay * (attempt + 1)); // Exponential backoff
        });
      }
      throw err;
    }
  }, [fetcher, retry, retryDelay]);

  const fetchData = useCallback(async (force: boolean = false) => {
    if (!enabled || (!force && fetchingRef.current)) {
      return null;
    }

    const now = Date.now();
    const shouldDedupe = !force && now - lastFetchTimeRef.current < dedupingInterval;
    
    if (shouldDedupe) {
      return data;
    }

    // Cancel any existing fetch
    cleanup();
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    // Increment request ID to track the latest request
    const currentRequestId = ++requestIdRef.current;

    // Check cache if we have a cacheKey and not forcing refresh
    if (cacheKey && !force) {
      const cached = cache[cacheKey];
      if (cached && cached.expiresAt > now) {
        // Update LRU cache tracking
        lruCache.get(cacheKey);
        
        if (isMountedRef.current) {
          setData(cached.data);
          setIsLoading(false);
          setError(null);
          onSuccess?.(cached.data);
        }
        return cached.data;
      }
    }

    fetchingRef.current = true;
    if (isMountedRef.current) {
      // Only set loading to true if we don't have stale data
      if (!(staleWhileRevalidate && data)) {
        setIsLoading(true);
      }
      setError(null);
    }
    
    lastFetchTimeRef.current = now;

    try {
      const result = await executeWithRetry(0, currentRequestId);
      
      // If component was unmounted or a newer request was made
      if (!isMountedRef.current || currentRequestId !== requestIdRef.current) {
        fetchingRef.current = false;
        return null;
      }
      
      // Update cache if we have a cacheKey and a valid result
      if (cacheKey && result !== null) {
        cache[cacheKey] = {
          data: result,
          timestamp: now,
          expiresAt: now + cacheDuration
        };
        
        // Update LRU cache tracking
        lruCache.put(cacheKey, now);
      }

      if (isMountedRef.current) {
        setData(result);
        setIsLoading(false);
        onSuccess?.(result);
      }
      
      fetchingRef.current = false;
      return result;
    } catch (err) {
      console.error("Fetch error:", err);
      
      fetchingRef.current = false;
      
      if (isMountedRef.current && currentRequestId === requestIdRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
      
      return null;
    }
  }, [
    cacheKey, 
    cacheDuration, 
    data, 
    dedupingInterval, 
    enabled, 
    executeWithRetry, 
    onSuccess, 
    onError, 
    cleanup, 
    staleWhileRevalidate
  ]);

  // Invalidate cache for a specific key - optimized implementation
  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      delete cache[key];
    } else if (cacheKey) {
      delete cache[cacheKey];
    }
  }, [cacheKey]);

  // Clear entire cache - optimized implementation
  const clearCache = useCallback(() => {
    // More efficient approach using Object.keys for better performance
    Object.keys(cache).forEach(key => {
      delete cache[key];
    });
    
    // Also clear the LRU tracking
    lruCache.clear();
  }, []);

  // Cleanup function for component unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    if (enabled) {
      fetchData();
    }
    
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [enabled, fetchData, cleanup]);

  return {
    data,
    isLoading,
    error,
    refetch: (force: boolean = true) => fetchData(force),
    invalidateCache,
    clearCache
  };
}
