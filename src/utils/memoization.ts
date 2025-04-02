
type CacheKey = string | number;

interface MemoizeOptions {
  maxCacheSize?: number;
  ttl?: number; // Time to live in milliseconds
}

/**
 * Creates a memoized function that caches results based on input arguments
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T, 
  options: MemoizeOptions = {}
): T {
  const { 
    maxCacheSize = 100,
    ttl = 1000 * 60 * 5, // 5 minutes default
  } = options;
  
  const cache = new Map<CacheKey, { value: ReturnType<T>, timestamp: number }>();
  
  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    // Create a cache key from the arguments
    const key = JSON.stringify(args);
    const now = Date.now();
    
    if (cache.has(key)) {
      const cached = cache.get(key)!;
      // Check if the cached value is still valid
      if (now - cached.timestamp < ttl) {
        return cached.value;
      }
      // If expired, remove it
      cache.delete(key);
    }
    
    // Enforce cache size limit
    if (cache.size >= maxCacheSize) {
      // Remove the oldest entry
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    
    // Compute and cache the result
    const result = fn(...args);
    cache.set(key, { value: result, timestamp: now });
    
    return result;
  }) as T;
  
  return memoized;
}
