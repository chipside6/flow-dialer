
/**
 * Enhanced resource optimization service to prioritize critical assets
 */

// Script loading priorities
export enum LoadPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  IDLE = 'idle'
}

// Track loaded scripts to avoid duplicates
const loadedScripts: Set<string> = new Set();
const loadedStyles: Set<string> = new Set();

// Performance metrics tracking
interface PerformanceMetrics {
  resourceLoadTimes: Record<string, number>;
  navigationStart: number;
  domContentLoaded: number | null;
  firstPaint: number | null;
  firstContentfulPaint: number | null;
}

const metrics: PerformanceMetrics = {
  resourceLoadTimes: {},
  navigationStart: performance.now(),
  domContentLoaded: null,
  firstPaint: null,
  firstContentfulPaint: null
};

// Track DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  metrics.domContentLoaded = performance.now();
});

// Try to capture paint metrics if available
if ('performance' in window && 'getEntriesByType' in performance) {
  const observer = new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (entry.name === 'first-paint') {
        metrics.firstPaint = entry.startTime;
      } else if (entry.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = entry.startTime;
      }
    }
  });
  
  try {
    observer.observe({ type: 'paint', buffered: true });
  } catch (e) {
    console.warn('Paint timing API not supported:', e);
  }
}

/**
 * Dynamically load a script with specified priority and improved error handling
 */
export const loadScript = (
  src: string,
  priority: LoadPriority = LoadPriority.MEDIUM,
  attributes: Record<string, string> = {},
  timeout: number = 10000
): Promise<void> => {
  if (loadedScripts.has(src)) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    
    // Set priority using fetchpriority attribute
    if (priority === LoadPriority.CRITICAL || priority === LoadPriority.HIGH) {
      script.setAttribute('fetchpriority', 'high');
    }
    
    // Add custom attributes
    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });
    
    // Add async for non-critical resources
    if (priority !== LoadPriority.CRITICAL) {
      script.async = true;
    }
    
    // Add defer for low priority resources
    if (priority === LoadPriority.LOW || priority === LoadPriority.IDLE) {
      script.defer = true;
    }
    
    // Track load time
    const startTime = performance.now();
    
    script.onload = () => {
      loadedScripts.add(src);
      metrics.resourceLoadTimes[src] = performance.now() - startTime;
      resolve();
    };
    
    script.onerror = (error) => {
      console.error(`Failed to load script: ${src}`, error);
      reject(new Error(`Failed to load script: ${src}`));
    };
    
    // Add timeout protection
    const timeoutId = setTimeout(() => {
      if (!loadedScripts.has(src)) {
        console.warn(`Script load timeout for: ${src}`);
        reject(new Error(`Script load timeout: ${src}`));
      }
    }, timeout);
    
    script.onload = () => {
      clearTimeout(timeoutId);
      loadedScripts.add(src);
      metrics.resourceLoadTimes[src] = performance.now() - startTime;
      resolve();
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Dynamically load a CSS stylesheet with specified priority
 */
export const loadStylesheet = (
  href: string,
  priority: LoadPriority = LoadPriority.MEDIUM
): Promise<void> => {
  if (loadedStyles.has(href)) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.type = 'text/css';
    
    // Set priority attribute if supported
    if (priority === LoadPriority.CRITICAL || priority === LoadPriority.HIGH) {
      link.setAttribute('fetchpriority', 'high');
    }
    
    // Track load time
    const startTime = performance.now();
    
    link.onload = () => {
      loadedStyles.add(href);
      metrics.resourceLoadTimes[href] = performance.now() - startTime;
      resolve();
    };
    
    link.onerror = (error) => {
      console.error(`Failed to load stylesheet: ${href}`, error);
      reject(new Error(`Failed to load stylesheet: ${href}`));
    };
    
    document.head.appendChild(link);
  });
};

/**
 * Preconnect to important domains to speed up subsequent requests
 */
export const setupPreconnect = (domains: string[]) => {
  domains.forEach(domain => {
    if (domain) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      
      // Also add dns-prefetch as fallback for browsers that don't support preconnect
      const dnsLink = document.createElement('link');
      dnsLink.rel = 'dns-prefetch';
      dnsLink.href = domain;
      document.head.appendChild(dnsLink);
    }
  });
};

/**
 * Preload critical resources
 */
export const preloadCriticalResources = (resources: {url: string, as: 'script' | 'style' | 'image' | 'font'}[]) => {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.url;
    link.as = resource.as;
    
    if (resource.as === 'font') {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
};

// Type definition for Network Information API
interface NetworkInformation {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  saveData?: boolean;
  rtt?: number;
  downlink?: number;
}

/**
 * Safely checks if the user is on a slow connection
 */
const isSlowConnection = (): boolean => {
  // Check if Network Information API is available
  if (
    'connection' in navigator && 
    (navigator as any).connection && 
    (navigator as any).connection.effectiveType
  ) {
    const connection = (navigator as any).connection as NetworkInformation;
    return connection.effectiveType === 'slow-2g' || 
           connection.effectiveType === '2g' || 
           (connection.saveData === true);
  }
  
  // Fallback: check if we're in a reduced motion preference
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }
  
  // Fallback: if we can't detect, assume it's not a slow connection
  return false;
};

/**
 * Initialize performance optimizations
 */
export const initResourceOptimizations = () => {
  // Preconnect to essential domains
  setupPreconnect([
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    window.location.origin,
    import.meta.env.VITE_SUPABASE_URL,
  ]);
  
  // Detect slow connections and reduce resource loading
  if (isSlowConnection()) {
    // Set up reduced quality resources for slow connections
    document.documentElement.classList.add('slow-connection');
    
    // Disable animations on slow connections
    document.documentElement.classList.add('no-animations');
    
    // Apply lower resolution images for slow connections
    const style = document.createElement('style');
    style.innerHTML = `
      .slow-connection img:not([data-high-priority]) {
        image-rendering: auto;
        filter: brightness(1.03);
      }
      .no-animations * {
        transition: none !important;
        animation: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Listen for route changes to update metrics
  window.addEventListener('popstate', () => {
    metrics.navigationStart = performance.now();
  });
};

/**
 * Get performance metrics for optimization analysis
 */
export const getPerformanceMetrics = (): PerformanceMetrics => {
  return { ...metrics };
};

/**
 * Register a custom performance mark
 */
export const markPerformance = (name: string) => {
  if ('performance' in window && 'mark' in performance) {
    try {
      performance.mark(name);
    } catch (e) {
      console.warn(`Failed to create performance mark "${name}":`, e);
    }
  }
};

// Initialize optimizations automatically
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initResourceOptimizations);
  } else {
    initResourceOptimizations();
  }
}
