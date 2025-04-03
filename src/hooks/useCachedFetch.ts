
import { useState, useEffect, useCallback } from 'react';
import { isAuthError, isOfflineError } from '@/utils/apiHelpers';
import { toast } from '@/components/ui/use-toast';

// Type for the cached data
interface CachedItem<T> {
  data: T;
  timestamp: number;
}

// Options for the useCachedFetch hook
interface UseCachedFetchOptions<T> {
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  enabled?: boolean;
  initialData?: T;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showErrorToast?: boolean; // New option to control error toast display
}

/**
 * A hook for fetching data with caching and automatic retries
 * @param fetchFn The function that fetches the data
 * @param options Configuration options
 * @returns Object with data, error, isLoading, and refetch
 */
export function useCachedFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseCachedFetchOptions<T> = {}
) {
  const {
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
    initialData,
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    showErrorToast = true // Default to showing error toasts
  } = options;
  
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  
  // Function to check if cached data is valid
  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < cacheDuration;
  }, [cacheDuration]);
  
  // Function to get data from cache
  const getFromCache = useCallback((): T | undefined => {
    if (!cacheKey) return undefined;
    
    try {
      const cachedJson = localStorage.getItem(`cache_${cacheKey}`);
      if (!cachedJson) return undefined;
      
      const cached: CachedItem<T> = JSON.parse(cachedJson);
      if (!isCacheValid(cached.timestamp)) {
        // Cache expired
        localStorage.removeItem(`cache_${cacheKey}`);
        return undefined;
      }
      
      return cached.data;
    } catch (e) {
      console.warn('Error reading from cache:', e);
      return undefined;
    }
  }, [cacheKey, isCacheValid]);
  
  // Function to save data to cache
  const saveToCache = useCallback((data: T) => {
    if (!cacheKey) return;
    
    try {
      const item: CachedItem<T> = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(`cache_${cacheKey}`, JSON.stringify(item));
    } catch (e) {
      console.warn('Error saving to cache:', e);
    }
  }, [cacheKey]);
  
  // Function to fetch data
  const fetchWithRetry = useCallback(async (force = false): Promise<T | undefined> => {
    // If we shouldn't fetch, return
    if (!enabled) return undefined;
    
    // If not forcing and we're already loading, don't start another fetch
    if (!force && isLoading) return undefined;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to get from cache first if not forcing
      if (!force && cacheKey) {
        const cachedData = getFromCache();
        if (cachedData) {
          setData(cachedData);
          setIsLoading(false);
          onSuccess?.(cachedData);
          return cachedData;
        }
      }
      
      // Fetch fresh data
      const freshData = await fetchFn();
      
      // Save to cache and update state
      saveToCache(freshData);
      setData(freshData);
      setAttemptCount(0);
      onSuccess?.(freshData);
      
      return freshData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      // Show error toast if enabled
      if (showErrorToast) {
        toast({
          title: "Data fetch error",
          description: error.message,
          variant: "destructive"
        });
      }
      
      // Don't retry auth errors
      if (isAuthError(error)) {
        onError?.(error);
        return undefined;
      }
      
      // For offline errors, use cache if available
      if (isOfflineError(error) && cacheKey) {
        const cachedData = getFromCache();
        if (cachedData) {
          setData(cachedData);
          // Still return the error for proper handling
          onError?.(error);
          return cachedData;
        }
      }
      
      // Retry logic
      if (attemptCount < retry) {
        setAttemptCount(prev => prev + 1);
        setTimeout(() => {
          fetchWithRetry(force);
        }, retryDelay * Math.pow(2, attemptCount));
      } else {
        onError?.(error);
      }
      
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [
    enabled, isLoading, cacheKey, getFromCache, fetchFn, saveToCache, 
    attemptCount, retry, retryDelay, onSuccess, onError, showErrorToast
  ]);
  
  // Refetch data function to expose
  const refetch = useCallback((force = false) => {
    return fetchWithRetry(force);
  }, [fetchWithRetry]);
  
  // Initial fetch on mount or when dependencies change
  useEffect(() => {
    // Try to get from cache immediately
    if (cacheKey) {
      const cachedData = getFromCache();
      if (cachedData) {
        setData(cachedData);
        onSuccess?.(cachedData);
      }
    }
    
    // If cache miss or no cache key, fetch fresh data
    if (enabled) {
      fetchWithRetry(false);
    }
  }, [enabled, cacheKey, getFromCache, fetchWithRetry, onSuccess]);
  
  return { data, error, isLoading, refetch };
}
