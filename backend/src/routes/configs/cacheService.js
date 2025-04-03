
// Cache mechanism for config generation
const configCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached data or generate new
const getCachedOrGenerate = async (cacheKey, generateFn) => {
  const now = Date.now();
  const cached = configCache.get(cacheKey);
  
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }
  
  const data = await generateFn();
  configCache.set(cacheKey, { data, timestamp: now });
  return data;
};

// Periodically clean up the cache
const setupCacheCleanup = () => {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of configCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        configCache.delete(key);
      }
    }
  }, 15 * 60 * 1000); // Clean up every 15 minutes
};

module.exports = {
  getCachedOrGenerate,
  setupCacheCleanup
};
