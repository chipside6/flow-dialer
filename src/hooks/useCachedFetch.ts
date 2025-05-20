
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for fetching data with caching and loading state management
 * @param fetchFn - Function that returns a Promise with data
 * @param initialData - Default data before fetch completes
 * @param cacheKey - Optional key for caching in localStorage
 * @param dependencyArray - Dependencies to trigger refetch
 */
export function useCachedFetch<T>(
  fetchFn: () => Promise<T>,
  initialData: T,
  cacheKey?: string,
  dependencyArray: any[] = []
) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  // Get cached data if available
  useEffect(() => {
    if (!cacheKey) return;

    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const { data: storedData, timestamp } = JSON.parse(cachedData);
        setData(storedData);
        setLastFetched(timestamp);
        
        // Still fetch fresh data but don't show loading state
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error retrieving cached data:', err);
    }
  }, [cacheKey]);

  // Define refetch function that doesn't cause infinite loop
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

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
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, cacheKey]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    refetch();
    // Include all dependencies in the dependency array to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencyArray, refetch]);

  return {
    data,
    isLoading,
    error,
    refetch,
    lastFetched,
  };
}

export default useCachedFetch;
